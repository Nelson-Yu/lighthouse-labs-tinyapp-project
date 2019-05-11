# TinyApp Project

Tinyapp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product

!["Screenshot of URLs page"](https://github.com/Nelson-Yu/lighthouse-labs-tinyapp-project/blob/master/docs/urls-index.png)
!["Screenshot of URL edit page"](https://github.com/Nelson-Yu/lighthouse-labs-tinyapp-project/blob/master/docs/urls-id.png)

## Getting Started

- Create a working directory for where you intend to keep TinyApp.
- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.

## How To Use

- Once server is operational, visit localhost:8080/ in your browser to access TinyApp.
- Please login in order to use TinyApp. If you do not have an account, create one at localhost:8080/register.
- Once logged in feel free to shorten a URL at localhost:8080/urls/new.
- See your list of shortened URLs at localhost:8080/urls. Delete or edit your URLs here.

## Dependencies

- Node.js
- Express
- bcrypt
- body-parser
- cookie-session
