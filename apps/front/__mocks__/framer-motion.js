// __mocks__/framer-motion.js

function cleanProps(props) {
  const safe = { ...props };
  delete safe.whileHover;
  delete safe.initial;
  delete safe.animate;
  delete safe.exit;
  delete safe.transition;
  delete safe.whileTap;
  delete safe.whileDrag;
  delete safe.drag;
  delete safe.dragConstraints;
  return safe;
}

module.exports = {
  motion: new Proxy(
    {},
    {
      get: (_, tag) => {
        return ({ children, ...rest }) => {
          const Component = tag;
          return <Component {...cleanProps(rest)}>{children}</Component>;
        };
      },
    }
  ),

  AnimatePresence: ({ children }) => (
    <div data-testid="animate">{children}</div>
  ),
};
