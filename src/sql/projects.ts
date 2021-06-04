import { PositionType, ProjectType, UserType } from 'types/interfaces';

export const createProjectSQL =
  'INSERT INTO projects (owner_id, name, description) VALUES ($1, $2, $3) RETURNING id';

export const createProjectPositionsSQL =
  'INSERT INTO project_needed_positions (project_id, user_position, count) VALUES ($1, $2, $3)';

export type GetProjectsSQLType = Omit<ProjectType, 'positions' | 'users'> &
  Pick<UserType, 'username'>;

export const getProjectByIdSQL =
  'SELECT projects.*, users.username FROM projects JOIN users ON users.id = projects.owner_id WHERE projects.id = $1';

export type GetProjectsPositionsSQLType = PositionType;

export const getProjectPositionsSQL =
  'SELECT user_position, count FROM project_needed_positions WHERE project_id = $1';

// DELETE IT
export const updateProjectPositionsSQL =
  'UPDATE project_needed_positions SET user_position = $2, count = $3 WHERE project_id = $1';
