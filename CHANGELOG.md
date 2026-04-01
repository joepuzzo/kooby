# Changelog

## 1.0.8 ( April 1st, 2026 )

### Updated

- Koobys message role pills to be slightly more sleek

## 1.0.7 ( March 31st, 2026 )

### Updated

- Kooby to accept a socketId

## 1.0.6 ( March 31st, 2026 )

### Updated

- Kooby to not show tool_call messages

## 1.0.5 ( March 31st, 2026 )

### Updated

- Kooby to not show tool messages

## 1.0.4 ( March 31st, 2026 )

### Added

- Tooltip labels on icon action buttons using `TooltipTrigger` + `Tooltip` (copy message, feedback actions, reset, expand) for clearer UI affordances.

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
