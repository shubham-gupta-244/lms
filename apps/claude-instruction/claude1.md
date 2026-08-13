1.Claude this the project folder , i am building an learning managment sysytem .
2.This is a monorepo create two folder in app directory one backend folder and another frontend folder.
3.So lets Start with backend the backend should be using bun runtime and express as a for writing api .
4.there should be sighnup and signin endpoint .
5.the baseurl will be - https://syncsphere-hiv6.onrender.com this is the base url for fetching data .
6.you have to write a endpoint there will be no authentication two these endpoint it should be open for all request .

6.1
skillPath/api/v1/assignment/course-data this should be our first backend endpoint which is a get endpoint
it shloud fetch the course data from baseurl/assignment/course-data
Returns an array of 5 to 10 courses. The count changes between calls, so don't build for exactly 8 cards. Each course looks like this

{
"courseName": "How To YouTube",
"courseCode": "how-to-youtube",
"description": "From concept to creation, learn how to build, grow, and monetize a YouTube channel using practical systems and real-world execution.",
"mainCategory": "Content Creation",
"shortCourse": "YouTube",
"courseType": "Original",
"pricePaise": 199900,
"priceUsdCents": 3999,
"mangoId": "a1b2c3d4e5f6789012345678",
"refundable": true
}

it will do an api call to baseurl/assignment/country-code for the data
Returns {"country_code": "IN"} or {"country_code": "US"}. It flips between the two.

the api that i gave you for fetching data might give you wrong details or show the status code of 404 or 500 for both the api calls so should be responsible for proper error handling and schema checking

This decides the price you show. IN means show rupees from pricePaise. US means show dollars from priceUsdCents. Notice the units. 199900 paise is not ₹1,99,900. If a card says that, we stop reading , so fix this conversion to rupee and dollar for respecitve currency in backend endpoint only , the user should see the final price in rupee or in dollar only on frontend , it should include point value also foreg - 199.99 rupee

7. now lets come two frontend

A landing page in Framer for a fake learning platform. Call it Skillpath.
One section of that page pulls live data from the backend endpoint . That section is what we're actually looking at. The rest is just the stuff around it.

The page needs three things.
A hero. Headline, one line under it, one button. Design it however you want.
A courses section. This is the real test. More on it below.
A footer. Three links and a copyright line. Don't overthink it.

the data thats comes from the api will help to build the card component for courses , the api will return you array of courses you have to loop through it and create different section of courses based on the mainCategory field in the api response

and this main category of course will have sub category based on the shortCourse field in the api response

so final structure should look like there will be multiple courses like socialmedia , video Editing etch which will have multiple sub coursers youtube , twitter etch

A search box that filters the courses
Sort by price
Skeleton loaders instead of a spinner
A retry button when it fails
A "refundable" badge that only shows when it's true

some rules you should remeber while building frontend

1. Not with Framer's Fetch. Fetch can't loop through arrays, so you can't build a grid with it. Write a React code component and do the fetching inside it.

2. Handle what happens when things go wrong.

3.We're telling you upfront: this API fails on purpose. Roughly 1 in 3 requests returns a 404 or 500. Both endpoints. That's not a bug, that's the test.

4. Four situations. Loading. Error. Zero results. Working.

5. If your page goes blank or dumps a raw error on screen, you lose this section. And think about what happens when the country call fails but the course call works. What do you show? There's no single right answer. There are wrong ones.

6. Only GET works.

7. Every other method returns a 405. If your component is sending anything else, ask yourself why.
   Give us two property controls.

8. Someone who can't code should be able to change something from the Framer panel without touching your code. You pick which two. Pick the ones a designer would actually ask for.
   Make it work on phones.

9 .3 columns on desktop. 2 on tablet. 1 on mobile. Nothing should break in between. Remember the card count varies, so the grid can't assume a nice round number.

10. Don't hardcode the data.

11 .keep one thing in ming dont use the flashy colors like green red or blue use suttle colors for the frontend design like dark purple ,white ,balck , there shlouold be varient of button for the particular use case

12. use microInteraction and small details that creates the difference for eg animation and transitions and more effects that live life to landing page

this is a monorepo wo whatever the shared code is write it in package folder

first write test for backend and build backend test it and than build it , move to frontend this would be the flow you have to do test driven development
