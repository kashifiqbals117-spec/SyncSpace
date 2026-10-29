import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';
import { Badge } from '../components/ui/Badge.jsx';

describe('Frontend UI Components', () => {
  it('1. Button renders with primary variant and triggers click', () => {
    let clicked = false;
    render(
      <Button variant="primary" onClick={() => (clicked = true)}>
        Submit Task
      </Button>
    );

    const btn = screen.getByRole('button', { name: /submit task/i });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(clicked).toBe(true);
  });

  it('2. Button disables and shows spinner when isLoading is true', () => {
    render(
      <Button variant="primary" isLoading={true}>
        Save
      </Button>
    );

    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
  });

  it('3. Input displays validation error message properly', () => {
    render(
      <Input
        label="Project Title"
        error="Title must be at least 3 characters"
        defaultValue="hi"
      />
    );

    expect(screen.getByText('Project Title')).toBeInTheDocument();
    expect(screen.getByText('Title must be at least 3 characters')).toBeInTheDocument();
  });

  it('4. Badge renders appropriate variant styling', () => {
    render(<Badge variant="danger">URGENT</Badge>);
    const badge = screen.getByText('URGENT');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('text-rose-300');
  });

  it('5. EmptyState displays custom title, description, and action button', () => {
    let actionTriggered = false;
    render(
      <EmptyState
        title="No tasks found"
        description="Create your first task"
        actionLabel="Add Task"
        onAction={() => (actionTriggered = true)}
      />
    );

    expect(screen.getByText('No tasks found')).toBeInTheDocument();
    expect(screen.getByText('Create your first task')).toBeInTheDocument();
    const actionBtn = screen.getByRole('button', { name: /add task/i });
    fireEvent.click(actionBtn);
    expect(actionTriggered).toBe(true);
  });
});
