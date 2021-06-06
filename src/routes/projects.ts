import express, { Request, Response } from 'express';
import Joi from 'joi';
import { PoolClient } from 'pg';

import pool from 'dbconfig';
import middlewares from 'middlewares';
import { createDebug, formatError, formatResponse, areArrayElementsUnique } from 'utils';
import { UserPositions, ErrorCodes, Status, SuccessCodes } from 'types/enums';
import {
  CreateProjectReqBody,
  CreateProjectResponseData,
  GetProjectResponseData,
  GetProjectByIdParams,
  GetProjectsAllQueryParams,
  GetAllProjectsResponseData,
} from 'types/interfaces';
import {
  createProjectPositionsSQL,
  createProjectSQL,
  getProjectByIdSQL,
  getProjectPositionsSQL,
  GetProjectsPositionsSQLType,
  GetProjectsSQLType,
  getAllProjectsSQL,
  GetAllProjectsSQLType,
} from 'sql';

const { validation, authorise } = middlewares;

const debug = createDebug('projects');

const router = express.Router();

router.get(
  '/:id',
  [
    validation({
      params: Joi.object({
        id: Joi.number().positive().required(),
      }),
    }),
  ],
  async (req: Request<GetProjectByIdParams, {}, {}>, res: Response) => {
    const { id } = req.params;
    let client: PoolClient | undefined;

    try {
      client = await pool.connect();
      const resultGetProject = await client.query<GetProjectsSQLType>(getProjectByIdSQL, [id]);
      debug('Project get by id result: %O', resultGetProject);
      if (!resultGetProject.rows.length) {
        client.release();
        res.status(Status.NOT_FOUND).json(formatError(ErrorCodes.NOT_FOUND));
        return;
      }
      const projectData = resultGetProject.rows[0];

      const resultGetProjectPositions = await client.query<GetProjectsPositionsSQLType>(
        getProjectPositionsSQL,
        [id]
      );
      debug('Project get positions by id result: %O', resultGetProjectPositions);
      const positions = resultGetProjectPositions.rows;

      client.release();
      res.status(Status.OK).json(
        formatResponse<GetProjectResponseData>({ ...projectData, positions })
      );
    } catch (err) {
      debug('Project get by id error: %O', err);
      client?.release();
      res.status(Status.INTERNAL_SERVER_ERROR).json(formatError());
    }
  }
);

router.get(
  '/',
  [
    validation({
      query: Joi.object({
        page: Joi.number().min(0).required(),
        limit: Joi.number().positive().max(20).required(),
        fromId: Joi.number().positive(),
      }),
    }),
  ],
  async (req: Request<{}, GetProjectsAllQueryParams, {}>, res: Response) => {
    const { fromId, page, limit } = req.query;
    let client: PoolClient | undefined;

    try {
      client = await pool.connect();
      const offset = Number(page) * Number(limit);
      const params = [offset, limit];
      if (fromId) params.push(Number(fromId));
      const resultProjectAll = await client.query<GetAllProjectsSQLType>(
        getAllProjectsSQL(Number(fromId || 0)),
        params
      );
      debug('Projects GET all result: %O', resultProjectAll);
      const projects = resultProjectAll.rows;
      client.release();
      res.status(Status.OK).json(formatResponse<GetAllProjectsResponseData>(projects));
    } catch (err) {
      debug('Projects GET all error: %O', err);
      client?.release();
      res.status(Status.INTERNAL_SERVER_ERROR).json(formatError());
    }
  }
);

router.post(
  '/',
  [
    authorise,
    validation({
      body: Joi.object({
        name: Joi.string().min(10).max(255).required(),
        description: Joi.string().min(30).max(2047).required(),
        positions: Joi.array()
          .items(
            Joi.object({
              position: Joi.string()
                .valid(...Object.values(UserPositions))
                .required(),
              count: Joi.number().positive().max(20).required(),
            })
          )
          .max([...Object.values(UserPositions)].length),
      }),
    }),
  ],
  async (req: Request<{ userId?: number }, {}, CreateProjectReqBody>, res: Response) => {
    const { name, description, positions } = req.body;
    const { userId } = req.params;
    let client: PoolClient | undefined;

    try {
      if (!userId) throw new Error('No userId');
      if (positions?.length && !areArrayElementsUnique(positions.map(({ position }) => position))) {
        res.status(Status.BAD_REQUEST).json(formatError(ErrorCodes.BAD_REQUEST));
        return;
      }
      client = await pool.connect();
      const resultProjectCreate = await client.query<{ id?: number }>(createProjectSQL, [
        userId,
        name,
        description,
      ]);
      debug('Project Create result: %O', resultProjectCreate);
      const projectId = resultProjectCreate?.rows[0]?.id;
      if (!projectId) throw new Error('Project id not returned from Create Project SQL query');

      positions?.forEach(async ({ position, count }) => {
        try {
          const resultAddProjectPosition = await client?.query(createProjectPositionsSQL, [
            projectId,
            position,
            count,
          ]);
          debug('Add Project Position result: %O', resultAddProjectPosition);
        } catch (err) {
          debug('Projects POST Add Position error: %O', err);
          client?.release();
          res.status(Status.INTERNAL_SERVER_ERROR).json(formatError());
        }
      });

      client.release();

      res
        .status(Status.CREATED)
        .json(formatResponse<CreateProjectResponseData>(null, SuccessCodes.PROJECT_CREATED));
    } catch (err) {
      debug('Projects POST error: %O', err);
      client?.release();
      res.status(Status.INTERNAL_SERVER_ERROR).json(formatError());
    }
  }
);

export { router as projects };
