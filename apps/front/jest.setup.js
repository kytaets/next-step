import '@testing-library/jest-dom';
import 'whatwg-fetch';

jest.mock('framer-motion', () => {
  const React = require('react');

  const MotionComponent = ({ children, ...rest }) => {
    const {
      whileHover,
      whileTap,
      initial,
      animate,
      exit,
      variants,
      transition,
      ...clean
    } = rest;

    return React.createElement('div', clean, children);
  };

  return {
    motion: new Proxy(
      {},
      {
        get: () => MotionComponent,
      }
    ),

    AnimatePresence: ({ children }) =>
      React.createElement('div', { 'data-testid': 'animate' }, children),
  };
});
