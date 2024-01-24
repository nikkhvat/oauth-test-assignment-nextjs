# Тестовое задание простого oauth сервера

## Запуск

```sh
npm i 
npm run dev
```

## Пример использывания 

1. Cоздаём пользователя через postman 

POST `http://localhost:3000/api/auth/register`

```json
{
  "username": "nikkhvat", 
  "password": "sdfeorefjiguhrewdqo"
}
```

Ответ:

```json
{
  "message": "User created",
  "userId": 1
}
```

2. Создаём клиента 

POST `http://localhost:3000/api/client/register`

```json
{
  "name": "clientName",
  "redirectUris": ["localhost:3001/redirect"]
}
```

Ответ:

```json
{
    "clientId": "104636c2e3f6f5b47979d283f864c743",
    "clientSecret": "481a692f4d39c430508b18e1c67a43ef9df07ad42a9100cc0e064f2e250493c4"
}
```

3. Переходим на authorize

GET `http://localhost:3000/api/auth/authorize?response_type=code&client_id=113b2c4aa149e87ed0b39dc8c8cc0cc2&redirect_uri=http%3A%2F%2Flocalhost%3A3001%2Fredirect&username=nikkhvat`

( тут вместо того что бы передать username нужно сделать страничку на которой будет спрашиваться разрешение у пользователя можно ли взять его данные, и из jwt токена достовать уже данные пользователя, я сделал это для упрощения )

Получаем редирект на url который указали с кодом 73f3536f2303d09ff490b9c8e678ab82

4. Получаем токен по секретному коду по которому можно будет достать информацию о пользователе

POST `http://localhost:3000/api/token`

```json
{
  "code": "73f3536f2303d09ff490b9c8e678ab82",
  "client_id": "104636c2e3f6f5b47979d283f864c743",
  "client_secret": "481a692f4d39c430508b18e1c67a43ef9df07ad42a9100cc0e064f2e250493c4",
}
```

Получаем токен доступа

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoibmlra2h2YXQiLCJpYXQiOjE3MDYxMTA0MjEsImV4cCI6MTcwNjExNDAyMX0.Teb5Zi-J4g7jSXuja1teyZMWlviExSqrA8JyO1AVgBs"
}
```

5. Получам данные пользователя по токену который нам вернул сервер 

GET `http://localhost:3000/api/user/userinfo`
в заголовок authorization передаём токен `Bearer ${token}`

Получаем в ответ данные пользователя

```json
{
  "username": "nikkhvat",
  "id": 1
}
```