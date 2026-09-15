import assert from 'node:assert/strict';
import test from 'node:test';
import { meetupSchema } from '../src/utils/meetup-schema.ts';

const base = {
  title: 'Test meetup',
  description: 'Synthetic test content',
  topics: ['Testing'],
};
const dated = {
  ...base,
  startsAt: '2027-01-15T18:00:00-07:00',
  venue: 'Test venue',
};
test('planning needs no invented date or venue', () => {
  const event = meetupSchema.parse({ ...base, status: 'planning' });
  assert.equal(event.draft, false);
  assert.ok(!('startsAt' in event));
});
test('scheduled meetups require a date with timezone and venue', () => {
  assert.equal(
    meetupSchema.safeParse({ ...base, status: 'scheduled' }).success,
    false,
  );
  assert.equal(
    meetupSchema.safeParse({
      ...dated,
      status: 'scheduled',
      startsAt: '2027-01-15',
    }).success,
    false,
  );
  assert.equal(
    meetupSchema.safeParse({ ...dated, status: 'scheduled' }).success,
    true,
  );
});
test('completed meetups require a recap and explicit project permission', () => {
  assert.equal(
    meetupSchema.safeParse({ ...dated, status: 'completed' }).success,
    false,
  );
  const project = {
    name: 'Test project',
    description: 'Test only',
    creator: 'Test contributor',
  };
  const completed = {
    ...dated,
    status: 'completed',
    recap: 'Discussed testing.',
    projects: [project],
  };
  assert.equal(meetupSchema.safeParse(completed).success, false);
  assert.equal(
    meetupSchema.safeParse({
      ...completed,
      projects: [{ ...project, permissionToPublish: true }],
    }).success,
    true,
  );
});
test('rejects executable and misleading repository links', () => {
  assert.equal(
    meetupSchema.safeParse({
      ...dated,
      status: 'scheduled',
      rsvp: 'javascript:alert(1)',
    }).success,
    false,
  );
  const project = {
    name: 'Test',
    description: 'Test',
    creator: 'Test',
    permissionToPublish: true,
    github: 'https://github.com.evil.example/test',
  };
  assert.equal(
    meetupSchema.safeParse({
      ...dated,
      status: 'completed',
      recap: 'Test',
      projects: [project],
    }).success,
    false,
  );
});
