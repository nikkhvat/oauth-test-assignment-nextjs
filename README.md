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
  "userId": 8
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
    "clientId": "cbb8051f-3897-42e3-b909-f8f56e7941a9",
    "clientSecret": "6b7bdd89-9b24-4d2c-b422-4507ae84fd87"
}
```

3. Переходим на authorize

GET `http://localhost:3000/api/auth/authorize?response_type=code&client_id=cbb8051f-3897-42e3-b909-f8f56e7941a9&redirect_uri=http%3A%2F%2Flocalhost%3A3001%2Fredirect&username=nikkhvat`

( тут вместо того что бы передать username нужно сделать страничку на которой будет спрашиваться разрешение у пользователя можно ли взять его данные, и из jwt токена достовать уже данные пользователя, я сделал это для упрощения )

Получаем редирект на url с кодом

(`http://localhost:3001/redirect?code=d11947ae-eaa5-44ea-8618-13c858a34409`)

4. Получаем токен по секретному коду по которому можно будет достать информацию о пользователе

POST `http://localhost:3000/api/token`

```json
{
  "code": "d11947ae-eaa5-44ea-8618-13c858a34409",
  "client_id": "cbb8051f-3897-42e3-b909-f8f56e7941a9",
  "client_secret": "6b7bdd89-9b24-4d2c-b422-4507ae84fd87"
}
```

Получаем токен доступа (jwt)

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjgsInVzZXJuYW1lIjoibmlra2h2YXQiLCJpYXQiOjE3MDYxMTc3NTMsImV4cCI6MTcwNjEyMTM1M30.XpmTYK4f0HKUXnQT-_1sZOcVKgPXFrSfWU5loTHwKXs"
}
```

5. Получам данные пользователя по токену который нам вернул сервер 

GET `http://localhost:3000/api/user/userinfo`
в заголовок authorization передаём токен `Bearer ${token}`

Получаем в ответ данные пользователя

```json
{
  "username": "nikkhvat",
  "id": 8
}
```