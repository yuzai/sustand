import { Create } from './types';
export { default as suspense } from './utils/suspense';
export { default as compute } from './utils/compute';
export { default as shallow } from 'zustand/shallow';
export * from './types';
declare const createSustand: Create;
export default createSustand;
