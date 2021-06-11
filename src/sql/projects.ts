import { PositionType, ProjectType } from 'types/interfaces';

export const createProjectSQL =
  'INSERT INTO projects (owner_id, name, description) VALUES ($1, $2, $3) RETURNING id';

export const createProjectPositionsSQL =
  'INSERT INTO project_needed_positions (project_id, user_position, count) VALUES ($1, $2, $3)';

export type GetProjectsSQLType = Omit<ProjectType, 'positions' | 'users'> & { authorname: string };

export const getProjectByIdSQL =
  'SELECT projects.*, users.username as authorname FROM projects JOIN users ON users.id = projects.owner_id WHERE projects.id = $1';

export type GetProjectsPositionsSQLType = PositionType;

export const getProjectPositionsSQL =
  'SELECT user_position as position, count FROM project_needed_positions WHERE project_id = $1';

export const getAllProjectsSQL = (id?: number) => `
    SELECT projects.id, projects.name, projects.description, projects.created_at, users.username as authorname
    FROM projects 
    JOIN users ON users.id = projects.owner_id 
    ${id ? 'WHERE projects.id <= $3' : ''}
    ORDER BY projects.created_at DESC
    OFFSET $1 ROWS
    LIMIT $2 
  `;

export type GetAllProjectsSQLType = Pick<
  ProjectType,
  'id' | 'name' | 'description' | 'createdAt' | 'ownerId'
> & { authorname: string };
