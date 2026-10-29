import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import prisma from '../../src/config/prisma.js';
import { isCloudinaryConfigured } from '../../src/config/cloudinary.js';

describe('Cloudinary Integration & Secure Uploads', () => {
  let userToken;
  let testUser;
  const uniqueId = Date.now();

  // 1x1 valid transparent PNG buffer
  const validPngBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
    'base64'
  );

  beforeAll(async () => {
    // Register a test user
    const res = await request(app).post('/api/v1/auth/register').send({
      name: 'Cloudinary Tester',
      email: `cloudinary_tester_${uniqueId}@syncspace.dev`,
      password: 'Password123!',
    });
    userToken = res.body.data.token;
    testUser = res.body.data.user;
  });

  afterAll(async () => {
    if (testUser?.id) {
      await prisma.workspace.deleteMany({ where: { ownerId: testUser.id } }).catch(() => {});
      await prisma.user.delete({ where: { id: testUser.id } }).catch(() => {});
    }
  });

  it('1. should verify Cloudinary environment credentials are configured', () => {
    expect(isCloudinaryConfigured()).toBe(true);
  });

  it('2. should reject upload without authentication (401)', async () => {
    const res = await request(app)
      .post('/api/v1/upload/avatar')
      .attach('avatar', validPngBuffer, 'avatar.png');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('3. should reject invalid file types with 400 Bad Request', async () => {
    const invalidBuffer = Buffer.from('hello world plain text');

    const res = await request(app)
      .post('/api/v1/upload/avatar')
      .set('Authorization', `Bearer ${userToken}`)
      .attach('avatar', invalidBuffer, 'notes.txt');

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Invalid file type/i);
  });

  it('4. should successfully upload an avatar to Cloudinary and persist to PostgreSQL', async () => {
    const res = await request(app)
      .post('/api/v1/upload/avatar')
      .set('Authorization', `Bearer ${userToken}`)
      .attach('avatar', validPngBuffer, 'profile.png');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.url).toBeDefined();
    expect(res.body.data.url).toContain('res.cloudinary.com');
    expect(res.body.data.publicId).toBeDefined();

    // Verify persistence in PostgreSQL
    const dbUser = await prisma.user.findUnique({
      where: { id: testUser.id },
      select: { avatarUrl: true },
    });

    expect(dbUser.avatarUrl).toBe(res.body.data.url);
  }, 15000); // 15s timeout for network request to Cloudinary

  it('5. should successfully upload a general image attachment to Cloudinary', async () => {
    const res = await request(app)
      .post('/api/v1/upload/image')
      .set('Authorization', `Bearer ${userToken}`)
      .attach('image', validPngBuffer, 'attachment.png');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.url).toContain('res.cloudinary.com');
    expect(res.body.data.publicId).toBeDefined();
  }, 15000);
});
