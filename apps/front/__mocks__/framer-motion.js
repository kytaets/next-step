const React = require('react');

// Props that must not reach DOM
const FORBIDDEN = [
  'whileHover',
  'whileTap',
  'initial',
  'animate',
  'exit',
  'transition',
  'whileDrag',
  'drag',
  'dragConstraints',
];

function cleanProps(props) {
  const safe = { ...props };
  FORBIDDEN.forEach((p) => delete safe[p]);
  return safe;
}

function createMockComponent(tag) {
  return React.forwardRef(({ children, ...rest }, ref) => {
    const Component = tag || 'div';
    return (
      <Component ref={ref} {...cleanProps(rest)}>
        {children}
      </Component>
    );
  });
}

module.exports = {
  motion: new Proxy(
    {},
    {
      get: (_, tag) => {
        return createMockComponent(tag);
      },
    }
  ),

  AnimatePresence: ({ children }) => (
    <div data-testid="animate-presence">{children}</div>
  ),
};
