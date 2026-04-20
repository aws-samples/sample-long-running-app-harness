import { test, expect } from '@playwright/test';

const API_URL = process.env.VITE_API_URL || 'https://q4rf5i4bal.execute-api.us-east-1.amazonaws.com';

test.describe('API Endpoints', () => {
  test('GET /projects returns valid JSON array', async ({ request }) => {
    const response = await request.get(`${API_URL}/projects`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
    expect(body.length).toBeGreaterThan(0);
  });

  test('GET /projects returns array of projects', async ({ request }) => {
    const response = await request.get(`${API_URL}/projects`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
  });

  test('POST /projects creates a project', async ({ request }) => {
    const response = await request.post(`${API_URL}/projects`, {
      data: {
        name: `E2E Test Project`,
        key: 'ETP',
        description: 'Created by e2e test',
      },
    });
    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.id).toBeTruthy();
    expect(body.name).toBe('E2E Test Project');
  });

  test('POST /projects rejects invalid body', async ({ request }) => {
    const response = await request.post(`${API_URL}/projects`, {
      data: { invalid: true },
    });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBeTruthy();
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  test('GET /search returns results', async ({ request }) => {
    const response = await request.get(`${API_URL}/search?q=test`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('issues');
    expect(body).toHaveProperty('projects');
    expect(body).toHaveProperty('total');
  });

  let createdProjectId: string;

  test('full project lifecycle: create, read, update, delete', async ({ request }) => {
    // Create
    const createRes = await request.post(`${API_URL}/projects`, {
      data: {
        name: 'Lifecycle Test',
        key: 'LCT',
        description: 'Testing full lifecycle',
      },
    });
    expect(createRes.status()).toBe(201);
    const project = await createRes.json();
    createdProjectId = project.id;

    // Read
    const readRes = await request.get(`${API_URL}/projects/${createdProjectId}`);
    expect(readRes.status()).toBe(200);
    const readProject = await readRes.json();
    expect(readProject.name).toBe('Lifecycle Test');

    // Update
    const updateRes = await request.put(`${API_URL}/projects/${createdProjectId}`, {
      data: { name: 'Lifecycle Test Updated' },
    });
    expect(updateRes.status()).toBe(200);
    const updatedProject = await updateRes.json();
    expect(updatedProject.name).toBe('Lifecycle Test Updated');

    // Create issue
    const issueRes = await request.post(`${API_URL}/projects/${createdProjectId}/issues`, {
      data: {
        type: 'Task',
        summary: 'Test issue for lifecycle',
        priority: 'Medium',
      },
    });
    expect(issueRes.status()).toBe(201);
    const issue = await issueRes.json();
    expect(issue.key).toBeTruthy();

    // Delete
    const deleteRes = await request.delete(`${API_URL}/projects/${createdProjectId}`);
    expect(deleteRes.status()).toBe(200);
  });
});
