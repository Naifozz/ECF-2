import csrf from 'csurf';

export const csrfProtection = csrf({
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    httpOnly: true,
  },
  value: (req) => {
    return (
      req.headers['x-csrf-token'] || (req.body && req.body._csrf) || undefined
    );
  },
});
