import * as dotenv from 'dotenv'

if (process.env.NODE_ENV == 'dev') {
    dotenv.config({ path: '.env' })
}