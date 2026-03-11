module.exports = {
  apps: [{
    name: 'hanuman-api',
    script: 'src/server.ts',
    interpreter: 'bun',
    env: {
      HANUMAN_PORT: 47779,
      HANUMAN_VECTOR_DB: 'lancedb',
    },
  }],
};
