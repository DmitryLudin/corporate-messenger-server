export const cors = {
  origin: [
    'http://localhost:3000',
    'http://localhost:80',
    'http://gateway',
    'http://ludind-video-conf.ru',
  ],
  credentials: true,
  methods: ['GET', 'PUT', 'POST', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Origin', 'Accept', 'Content-Type'],
};
