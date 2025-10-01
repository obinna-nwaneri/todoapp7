import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts'],
};

export default config;
