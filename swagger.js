import swaggerAutogen from 'swagger-autogen';
import dotenv from 'dotenv';
dotenv.config();
const hostOnly = new URL(fullUrl).host;

const doc = {
    info: {
        title: 'Shorten URL',
        description: 'Short URL Tool is a lightweight web application that allows users to shorten long URLs into compact, shareable links. Once generated, the short link can be pasted into any browser to automatically redirect to the original address.'
    },
    host: `${hostOnly}`,
};

const outputFile = './swagger-output.json';
const routes = ['./src/server.js'];

swaggerAutogen()(outputFile, routes, doc);