// ---------------------------------------------
// 🟦 1. @testing-library/jest-dom
// ---------------------------------------------
import '@testing-library/jest-dom';

// ---------------------------------------------
// 🟦 2. whatwg-fetch (fetch polyfill для тестов)
// ---------------------------------------------
import 'whatwg-fetch';

// ---------------------------------------------
// 🟦 3. Silence React 18 act() warnings
//    (не скрывает другие ошибки, только act)
// ---------------------------------------------
const originalConsoleError = console.error;

console.error = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('not wrapped in act')) {
    // игнорируем только этот тип warning
    return;
  }

  originalConsoleError(...args);
};

// ---------------------------------------------
// 🟦 4. Mock framer-motion
//    (убирает whileHover, whileTap, animate —
//     чтобы не было warning в тестах)
// ---------------------------------------------
jest.mock('framer-motion', () => {
  const React = require('react');

  const MotionComponent = ({ children, ...rest }) => {
    // убираем все motion-props, чтобы не попадали в DOM
    const {
      whileHover,
      whileTap,
      initial,
      animate,
      exit,
      variants,
      transition,
      ...cleanProps
    } = rest;

    return React.createElement('div', cleanProps, children);
  };

  return {
    motion: new Proxy(
      {},
      {
        get: () => MotionComponent, // motion.div, motion.span и т.д.
      }
    ),
    AnimatePresence: ({ children }) =>
      React.createElement(
        'div',
        { 'data-testid': 'animate-presence' },
        children
      ),
  };
});
