# Boxly 2.0

Серверная часть веб-сайта сервиса доставки товаров.

![GitHub top language](https://img.shields.io/github/languages/top/1habibi/Boxly2.0Server?color=yellow)
![GitHub commits count](https://img.shields.io/github/commit-activity/t/1habibi/Boxly2.0Server?color=blue)
![GitHub stars](https://img.shields.io/github/stars/1habibi/Boxly2.0Server?color=purple)
![GitHub contributors](https://img.shields.io/github/contributors/1habibi/Boxly2.0Server?color=green)
![Repository size](https://img.shields.io/github/repo-size/1habibi/Boxly2.0Server?color=yellow)
![Node.js Version](https://img.shields.io/badge/node-%3E%3D%2012.0.0-brightgreen)
![Open Source Love](https://img.shields.io/badge/open--source-%E2%9D%A4-red)

## Установка

1. Клонирование репозитория

`git clone https://github.com/1habibi/Boxly2.0Server.git`

2. Переход в директорию

`cd Boxly2.0Server`

3. Установка зависимостей

`npm install`

4. Настройка .env файла

5. Миграция базы данных

`npx prisma migrate dev --name init`

6. Запуск скрипта для запуска сервера

`npm run start:dev`

## Описание коммитов

| Название | Описание                                                        |
| -------- | --------------------------------------------------------------- |
| feat     | Добавление нового функционала                                   |
| fix      | Исправление ошибок                                              |
| refactor | Правки кода без исправления ошибок или добавления новых функций |
| docs     | Работа с документацией                                          |
| test     | Добавление тестов                                               |
