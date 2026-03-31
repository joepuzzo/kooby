# Changelog

## 1.0.3 ( March 31st, 2026 )

### Added

- `socketId` is now generated client-side in `Kooby` and always included in the handshake payload, making it directly accessible through `useKooby()`
- Example usage: custom toolbar render-prop now receives `socketId` alongside `conversation`, e.g.

```jsx
const CustomToolbar = ({ socketId }) => {
  const copySocketId = () => {
    navigator.clipboard.writeText(socketId);
  };

  return (
    <button type="button" onClick={copySocketId} aria-label="Copy SocketId">
      Copy
    </button>
  );
};
```

## 1.0.2 ( March 31st, 2026 )

### Fixed

- Issue where readme was not showing on NPM

## 1.0.1 ( March 31st, 2026 )

### Fixed

- Issue with width style on chatbox

## 1.0.0 ( March 31st, 2026 )

### Added

- Original Kooby components with adobe spectrum2
