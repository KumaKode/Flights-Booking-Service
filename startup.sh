#!/bin/bash

npx sequelize db:create
npx sequelize db:migrate
# npx sequelize db:seed:all //for test data
npm run dev