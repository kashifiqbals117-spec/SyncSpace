import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';

describe('Workspaces, Projects, and Tasks Workflow', () => {
  let userAToken, userBToken;
  let userAWorkspaceId;
  let userAProjectId;
  let userATaskId;

  beforeAll(async () => {
    const timestamp = Date.now();

    // Register User A
    const resA = await request(app).post('/api/v1/auth/register').send({
      name: 'Alice Alpha',
      email: `alice_${timestamp}@syncspace.dev`,
      password: 'Password123!',
    });
    userAToken = resA.body.data.token;
    userAWorkspaceId = resA.body.data.defaultWorkspaceId;

    // Register User B
    const resB = await request(app).post('/api/v1/auth/register').send({
      name: 'Bob Beta',
      email: `bob_${timestamp}@syncspace.dev`,
      password: 'Password123!',
    });
    userBToken = resB.body.data.token;
  });

  it('1. User A can create a custom workspace', async () => {
    const res = await request(app)
      .post('/api/v1/workspaces')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        name: 'Engineering Hub',
        description: 'Core platform engineering workspace',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Engineering Hub');
  });

  it('2. User B cannot access User A workspace (authorization enforced)', async () => {
    const res = await request(app)
      .get(`/api/v1/workspaces/${userAWorkspaceId}`)
      .set('Authorization', `Bearer ${userBToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('3. User A can create a project in their workspace', async () => {
    const res = await request(app)
      .post(`/api/v1/workspaces/${userAWorkspaceId}/projects`)
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        name: 'Payment Service',
        description: 'Stripe integration microservice',
        color: '#10b981',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Payment Service');
    userAProjectId = res.body.data.id;
  });

  it('4. User B cannot create a project in User A workspace', async () => {
    const res = await request(app)
      .post(`/api/v1/workspaces/${userAWorkspaceId}/projects`)
      .set('Authorization', `Bearer ${userBToken}`)
      .send({
        name: 'Malicious Project',
      });

    expect(res.status).toBe(403);
  });

  it('5. User A can create a task in the project', async () => {
    const res = await request(app)
      .post(`/api/v1/projects/${userAProjectId}/tasks`)
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        title: 'Implement Webhooks',
        description: 'Handle customer.subscription.deleted events',
        status: 'TODO',
        priority: 'HIGH',
        labels: [{ name: 'Stripe', color: '#6366f1' }],
      });

    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('Implement Webhooks');
    expect(res.body.data.status).toBe('TODO');
    userATaskId = res.body.data.id;
  });

  it('6. User A can move task to IN_PROGRESS and position is persisted', async () => {
    const res = await request(app)
      .patch(`/api/v1/tasks/${userATaskId}/move`)
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        status: 'IN_PROGRESS',
        newPosition: 2500.0,
      });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('IN_PROGRESS');
    expect(res.body.data.position).toBe(2500.0);

    // Verify persistence via GET
    const getRes = await request(app)
      .get(`/api/v1/tasks/${userATaskId}`)
      .set('Authorization', `Bearer ${userAToken}`);

    expect(getRes.status).toBe(200);
    expect(getRes.body.data.status).toBe('IN_PROGRESS');
    expect(getRes.body.data.position).toBe(2500.0);
  });

  it('7. User A can add comments on the task', async () => {
    const res = await request(app)
      .post(`/api/v1/tasks/${userATaskId}/comments`)
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        content: 'Testing Stripe CLI webhook triggers locally.',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.content).toBe('Testing Stripe CLI webhook triggers locally.');
  });

  it('8. User A can fetch notifications list and unread count', async () => {
    const res = await request(app)
      .get('/api/v1/notifications')
      .set('Authorization', `Bearer ${userAToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.notifications).toBeDefined();
    expect(typeof res.body.data.unreadCount).toBe('number');
  });
});
