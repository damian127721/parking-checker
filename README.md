# parking-checker

## Arduino project with frontend

### Technologies used:

- Frontend
  - NextJS (React full-stack framework)
  - Prisma
    - PostegreSQL
  - ChakraUI
  - Tailwindcss
- Microcontroller
  - Arduino
    - LoraWAN module
    - Ultrasonic sensor

## Setup

- Firstly, write environment variables to `.env` config file.
- Secondly, insert these commands to console to set up this project on your local machine:
  - `npm install`
  - `npx prisma migrate dev --name <something>`
  - `npm run dev`

### Description

- This project will simply check a parking spot if it's:
  - Free (Green) - corresponding to value 1
  - Occupied (Red) - corresponding to value 2
  - Unknown state (Purple) - corresponding to value 3
- Accessing editability for moving sectors (read all before editing !)
  - Press key CTRL + A to open admin modal login and enter password saved in .env hash format
  - ! When creating new Spots remember they are sorted alphabeticaly and one sector can handle 2 letters, therefore you must firstly create a new sector(the option is in the same modal), if the spot isn't consecutive to avaible spots or there is not enough space in current sectors, you will get an error and you need to remove the new spot from database
- Progress of getting data
  - Arduino -> LoraWAN -> Cloud Server -> API -> NextJS browser Client
  - Each change will take up apx. to 5 seconds.
