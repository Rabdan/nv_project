# Backend - NeuroVision

## Database Seeding

При запуске через Docker Compose автоматически создается пользователь admin:

- **Username**: `admin`
- **Password**: `admin123`

### Ручной запуск seed

Если нужно запустить seed вручную:

```bash
npm run seed
```

## Сессии JWT

Система использует сессии для управления JWT токенами:

- При логине создается сессия с токеном
- Токен сохраняется в базе данных в массиве `sessions` пользователя
- При каждом запросе проверяется наличие токена в активных сессиях
- При logout токен удаляется из сессий
- Истекшие сессии автоматически очищаются при новом логине

### API Endpoints

#### POST /auth/login
Вход в систему. Создает новую сессию.

```json
{
  "username": "admin",
  "password": "admin123"
}
```

#### POST /auth/logout
Выход из системы. Удаляет текущую сессию.

Требует заголовок: `Authorization: Bearer <token>`

## Docker

Запуск через Docker Compose:

```bash
docker-compose up --build
```

Seed выполняется автоматически при старте контейнера.
