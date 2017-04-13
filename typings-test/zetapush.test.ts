/// <reference path="../typings/zetapush.d.ts" />

const { Authentication, Client } = ZetaPush

const client = new Client({
  apiUrl: '',
  sandboxId: '',
  authentication: () => Authentication.simple({
    login: 'login',
    password: 'password'
  })
});

client.onSuccessfulHandshake((authentication) => {
  console.log(authentication);
});
