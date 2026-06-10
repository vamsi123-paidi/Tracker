# Full-stack MERN Quiz Application

## Authors

[Steffy Johnson](https://github.com/Steff4evr)

[Thi Nguyen](https://github.com/Thi-Tracey-Nguyen)

[Sian Steel](https://github.com/Essteel)

---

## Application and Project Repositories

- [Deployed site - Netlify](https://the-mern-quiz-app.netlify.app)
- [Planning Documentation](https://github.com/MERN-Quiz-App/Quiz-App-Docs)
- [Client repository - React App](https://github.com/MERN-Quiz-App/Quiz-App-Client)
- [Server repository - Express App](https://github.com/MERN-Quiz-App/Quiz-App-Server)

---

## How to Use the App

To use the App head to the deployed site to take quizzes, make quizzes and have fun!

To run the app locally please follow these steps:

### Requirements

- NodeJS version >19

- A [MongoDB](https://www.mongodb.com/cloud/atlas/register) Atlas account to host the database.

### Setup Instructions

1. Clone both the client and server repositories to separate folders on your computer using the clone button in GitHub or the installation codes below.
   
    Server:

   ```git clone https://github.com/MERN-Quiz-App/Quiz-App-Server.git ```

    Client:

   ```git clone https://github.com/MERN-Quiz-App/Quiz-App-Client.git```

2. Either in the terminal within the quiz-app and quiz-app-api folders of the client and server projects respectively, run the code ```npm install``` to add dependant libraries to the project.
3. In the server project add the link to your MongoDB Atlas server to a .env folder, following the format of the .env.sample file.
4. In the client project replace any urls within fetch requests to whichever local port you will run that project on e.g. ```http://localhost:5173/quizzes```.
5. Seed the database by running ```npm run seed``` within the server project.
6. Ensure both apps are running by using the command ```npm start```.
7. Go to your local host address within a browser and have fun!

---

## API Endpoints

### Category

<u>GET</u>

/  
Gets all categories

/:id  
Gets one category by its id

<u>POST</u>

/  
Posts a newly created category to the DB

<u>DELETE</u>

/:id  
Deletes one category by its id

<u>PUT</u>

/:id  
Updates one category by its id

#

### Question

<u>GET</u>

/  
Gets all questions

/:id  
Gets one question by its id

<u>POST</u>

/  
Post a new question to the DB

<u>DELETE</u>

/:id  
Deletes a question by its id

<u>PUT</u>

/:id  
Deletes one question by its id

#

### Quiz

<u>GET</u>

/  
Gets all quizzes

/:id  
Gets one quiz by its id

<u>POST</u>

/  
Post a new quiz to the DB

<u>DELETE</u>

/:id  
Deletes a quiz by its id

<u>PUT</u>

/:id  
Deletes one quiz by its id

---

## Resources

- [Bootstrap](https://getbootstrap.com/)
- [Unsplash](https://unsplash.com/)

#

### Libraries

<u>CLIENT</u>

- <strong>install:</strong> version 0.13.0
- <strong>npm:</strong> 9.4.1
- <strong>react:</strong> version 18.2.0
- <strong>react-bootstrap:</strong> version 2.7.0
- <strong>react-dom:</strong> version 18.2.0
- <strong>react-external-link:</strong> version 2.0.1
- <strong>react-router-dom:</strong> version 6.7.0

Development dependencies:

- <strong>@testing-library/jest-dom:</strong> ^5.16.5
- <strong>@testing-library/react:</strong> 13.4.0
- <strong>@testing-library/react-hooks:</strong> 8.0.1
- <strong>@testing-library/user-event:</strong> 14.4.3
- <strong>@types/react:</strong> version 18.0.26
- <strong>@types/react-dom:</strong> version 18.0.9
- <strong>@vitejs/plugin-react:</strong> version 3.0.0
- <strong>vite:</strong> 4.0.0

#

<u>SERVER</u>

- <strong>cors:</strong> version 2.8.5
- <strong>dotenv:</strong> version 16.0.3
- <strong>express:</strong> version 4.18.2
- <strong>mongoose:</strong> version 6.8.4

Development dependencies:

- <strong>jest:</strong> 29.3.1
- <strong>supertest:</strong> 6.3.3

---

## Project Management

We worked using the principles of Agile methodology, setting goals within short sprint cycles and regularly reviewing our progress and any blockers. Code was managed using a style similar to trunk-based development, with each member working on a feature within a branch separate to the main branch, then merging to main once the feature was working, or at least not causing a big error. This kept the main branch relatively bug free, whilst allowing us to make regular commits to pull down and help with features the other team members were working on.

Each day via Discord we would check in about our progress with our task from the previous day, provide details of any blockers so that the rest of the team may offer insight and update the team on our tasks for the current day. We held regular calls via Discord to discuss issues and provide more detailed updates and assistance to each other. We always had a call at the start of each new sprint to review whether we had made the progress we expected and to plan which tasks were to be undertaken during the next sprint.

Decisions and notes from the meetings were recorded within Trello and Google Docs which were stored within a Trello card for each sprint. Tasks established in meetings were recorded within a Trello card, assigned to at least one team member, given a difficulty level, completion data and checklist of to do items. When changes were made to the code relating to the task, the GIT commit details were recorded in a comment.

Tasks were delegated according to preference, skill set and capacity, taking into account individuals current home and health situation. We also ensured that everyone had the opportunity to work on both the front and back end to get experience with both. This also allowed us to further establish where our strengths and preferences lay. Sian is interested in design and user experience, and therefore suited to the creation of components and managing control flow within the front end. Thi is an all-rounder, able to pivot quickly to solve problems and create features within both the front and back end. Steffy has a passion for styling, using CSS and Bootstrap to make the application look just like the wireframes.

The Trello board can be viewed [here](https://trello.com/b/8A98I9sW/mern-quiz-app).

<details>

<summary><strong>Trello screenshots</strong></summary>

![23-01-23-Initial-App-Setup-SPRINT3](https://user-images.githubusercontent.com/110761232/217202601-75700fdf-eb0a-450f-8569-5904e3d3f166.png)
![24-01-23-Beginning-SPRINT3](https://user-images.githubusercontent.com/110761232/217202653-8c21313d-e068-430e-8e50-d9fa35fa3e23.png)
![26-01-23-Midway-through-SPRINT3](https://user-images.githubusercontent.com/110761232/217202692-556de5b6-555a-4e9e-9c9b-ca5cc185277a.png)
![27-01-23-End-of-SPRINT3](https://user-images.githubusercontent.com/110761232/217202715-3aef8343-dd57-4ecb-beb3-e99d1a711b33.png)
![29-01-23-Partway-through-SPRINT4](https://user-images.githubusercontent.com/110761232/217202741-d9aa2b21-d77e-4d3b-bb23-65995c1d2a2c.png)
![01-02-23-End-of-SPRINT4](https://user-images.githubusercontent.com/110761232/217202766-455df5ff-9b21-4c5c-bd07-77b6fe1183dc.png)
![03-02-23-Start-of-SPRINT5](https://user-images.githubusercontent.com/110761232/217202793-be5b1fbc-f646-4b91-bead-9fec6b0b3897.png)
![04-02-23-Partway-through-SPRINT5](https://user-images.githubusercontent.com/110761232/217202821-102eac71-add1-4b4c-ad83-c9bb5002aeb4.png)
![06-02-23-Start-SPRINT6](https://user-images.githubusercontent.com/110761232/217202840-651f66d0-b313-43df-add5-9082b8a25415.png)
![07-02-23-Card-example-SPRINT6](https://user-images.githubusercontent.com/110761232/217202861-47575de9-8bd6-48ec-8495-c86680aa37b5.png)
![08-02-23-Final-screenshot-SPRINT6](https://user-images.githubusercontent.com/110761232/217499257-c0b39777-351a-4921-af27-1a933689e93c.png)

</details>

---

## The final application

We were able to implement all MVP features and functionalities listed in the planning documentation. Although we had to make some small stylistic changes and changes to the way certain features were implemented due to complexity.

We made the decision not allow users to upload their own images when we realised images could not be stored within MongoDB Atlas without badly affecting the performance of the application. Therefore this issue was solved by having 12 images users could choose between to represent their quiz, and changing questions to just be text based.

---

## Testing

Testing was conducted both during development and once the application was completed to ensure that problems were caught and fixed throughout development. Both manual and automated testing were performed.

### Client

Manual testing of the sites functionality were checked by using the site and checking the features worked as expected.

<details>

<summary><strong>Website screenshots</strong></summary>
   
   
|  Tests                                                                                        |   Passed | Note  |   
|-----------------------------------------------------------------------------------------------|----------|-------|
| Quiz App Home page is displayed                                                               |     P    |       | 
| Quiz App Home page has 3 Quizzes are featured in home page                                    |     P    |       | 
| Featured Quizzes can be clicked to view the quiz                                              |     P    |       | 
| Navigation bar display's the correct navigation options                                       |     P    |       | 
| All Quizzes page is displayed correctly with all quizzes displayed                            |     P    |       | 
| All Quizzes page has Random Quiz Button displayed at the end of the page                      |     P    |       | 
| Random quiz button click invokes random quiz topics                                           |     P    |       | 
| Take a quiz shows the questions and timer countdown                                           |     P    |       | 
| Results page displays the quiz results, answers chosen and correct answers                    |     P    |       | 
| Categories page is displayed                                                                  |     P    |       | 
| Categories page has Random Category button displayed at the end of the page                   |     P    |       | 
| Random Category button click displays quizzes from a random cateogry                          |     P    |       | 
| Make a quiz page is displayed correctly                                                       |     P    |       | 
| Make a quiz page has option to add new category                                               |     P    |       | 
| Make a quiz page has next button which invokes page to add questions                          |     P    |       | 
| Add questions page is displayed correctly                                                     |     P    |       | 
| Edit a quiz page is displayed correcty                                                        |     P    |       | 
| Edit a quiz shows option to edit/delete any quizzes                                           |     P    |       | 
| Error handling when not entering all fields in add question                                   |     P    |       | 
|-----------------------------------------------------------------------------------------------|----------|-------|

Home Page
   
   ![screencapture-deploy-preview-79-the-mern-quiz-app-netlify-app-2023-02-08-20_00_32](https://user-images.githubusercontent.com/106674758/217483906-8aad227f-0209-48a1-8bda-633d2a7e0e58.png)

 

Take Quiz page
   
   ![screencapture-deploy-preview-79-the-mern-quiz-app-netlify-app-quizzes-63e31ba05949e9712593fd62-2023-02-08-20_07_00](https://user-images.githubusercontent.com/106674758/217484772-8b6a31eb-b9f8-47c1-b204-7c34296947af.png)
 
All Quizzes Page
   
   <img width="1503" alt="Screen Shot 2023-02-08 at 9 09 01 pm" src="https://user-images.githubusercontent.com/106674758/217499660-a86b8b9d-8b97-401a-9aed-7aa0086a886c.png">
   
   <img width="1503" alt="Screen Shot 2023-02-08 at 9 10 08 pm" src="https://user-images.githubusercontent.com/106674758/217499875-8495f438-0ae8-4597-baf5-19b8576a95d6.png">

Categories
   
   <img width="1503" alt="Screen Shot 2023-02-08 at 9 26 31 pm" src="https://user-images.githubusercontent.com/106674758/217503893-40bb80dd-01b7-447a-9c69-1d07e19e2116.png">

Make a quiz
   
   ![screencapture-deploy-preview-79-the-mern-quiz-app-netlify-app-make-a-quiz-2023-02-08-21_10_25](https://user-images.githubusercontent.com/106674758/217499989-4aa35b1e-c362-4507-8879-9fab532a8bef.png)

Add a category
   
   ![screencapture-deploy-preview-79-the-mern-quiz-app-netlify-app-add-a-category-2023-02-08-21_11_28](https://user-images.githubusercontent.com/106674758/217500222-ac376df6-d377-4dc3-8c17-f3dae9a4d667.png)

Make a quiz question 
   
   ![screencapture-deploy-preview-79-the-mern-quiz-app-netlify-app-add-questions-63e3761cf8f3dabad40170e3-2023-02-08-21_16_21](https://user-images.githubusercontent.com/106674758/217501339-76e8f7c0-921f-427c-91c0-bd651b46fab0.png)
![Error-handling-questions](https://user-images.githubusercontent.com/110761232/217523167-77821a75-8d08-46ed-bef3-6239fa669f54.png)

   
Edit a quiz
   
<img width="1503" alt="Screen Shot 2023-02-08 at 9 17 49 pm" src="https://user-images.githubusercontent.com/106674758/217501699-bd82a1d8-2a27-4a58-9cde-c0fb7d03ef7c.png">

 ![screencapture-deploy-preview-79-the-mern-quiz-app-netlify-app-edit-a-quiz-63e31ba05949e9712593fd65-2023-02-08-21_20_17](https://user-images.githubusercontent.com/106674758/217502267-ff6d2178-5773-4406-bbba-a46630a29e35.png)

   ![screencapture-deploy-preview-79-the-mern-quiz-app-netlify-app-edit-a-quiz-63e31ba05949e9712593fd65-questions-2023-02-08-21_20_48](https://user-images.githubusercontent.com/106674758/217502445-f0180133-4277-404c-b50d-197d3e52da82.png)

   
</details>
<br/>

Automated unit tests were created to test individual functions and features were working as expected. They were written and run using vitest.

<details>

<summary><strong>Unit test log screenshots</strong></summary>

Screenshots throughout the testing process
![Categories-test-failed-map-length](https://user-images.githubusercontent.com/110761232/217474653-b99cc1f5-f364-4177-af98-4cd0ce05b7ff.png)
![Edit-a-quiz-test-progress](https://user-images.githubusercontent.com/110761232/217474702-e40de9f7-e192-4c49-a55a-9afb4d6e0a02.png)
![All-3-tests-passing-class-error](https://user-images.githubusercontent.com/110761232/217474720-f1445c8c-81dc-4dcf-8f45-4ce8dd66d1d9.png)
![All-tests-passing-no-error](https://user-images.githubusercontent.com/110761232/217474776-267d2881-86d8-4b29-a327-58b0ad8bb087.png)

Categories
![Categories-test-passing](https://user-images.githubusercontent.com/110761232/217475596-f21768e3-ad02-4277-b91e-74b9a1f11f45.png)

Quizzes
![Quizzes-test-passing](https://user-images.githubusercontent.com/110761232/217475637-291b6373-f3d0-4acb-872b-ede66cb0233d.png)

Edit a Quiz
![EditAQuiz-test-passing](https://user-images.githubusercontent.com/110761232/217475696-dbfc7a33-122b-41d4-be86-f5b0abbbc597.png)

</details>
<br/>

Automated integration tests were created to check the application was functioning as a whole. These were also written and run using vitest.

<details>

<summary><strong>Integration test log screenshots</strong></summary>

   <img width="1055" alt="Screen Shot 2023-02-08 at 6 58 30 pm" src="https://user-images.githubusercontent.com/106674758/217469024-34f8c330-93aa-4486-86ca-c055587341b4.png">

</details>
<br/>

### Server

Manual testing of routes and CRUD operations were checked via Postman.

<details>

<summary><strong>Postman screenshots</strong></summary>

|  Tests                                                                                        |   Passed | Note  |   
|-----------------------------------------------------------------------------------------------|----------|-------|
| All quizzes retrieved successfully                                                            |     P    |       | 
| All category retrieved successfully                                                           |     P    |       | 
| All questions retrieved successfully                                                          |     P    |       | 
| Get a quiz by id                                                                              |     P    |       | 
| Get a category by id                                                                          |     P    |       | 
| Get a question by id                                                                          |     P    |       | 
| Post a new quiz                                                                               |     P    |       | 
| Post a new category                                                                           |     P    |       | 
| Post a new question                                                                           |     P    |       | 
| Delete a quiz                                                                                 |     P    |       | 
| Delete a category                                                                             |     P    |       | 
| Delete a question                                                                             |     P    |       | 
| Update a quiz                                                                                 |     P    |       | 
| Update a category                                                                             |     P    |       | 
| Update a question                                                                             |     P    |       | 
| Error thrown when quiz with duplicated name is created                                        |     P    |       | 
| Error thrown when posting a quiz with an invalid category                                     |     P    |       | 
| Error thrown when posting a quiz without an author                                            |     P    |       | 
| Error thrown when quiz name is too short                                                      |     P    |       |  
| Error thrown when category with duplicated name is created                                    |     P    |       | 
| Error thrown when category name is too short                                                  |     P    |       | 
| Error thrown when duplicated questions are created in the same quiz                           |     P    |       | 
| Error thrown when posting a question without a question (e.g. "What is the color of the sky?")|     P    |       | 
| Error thrown when posting a question without a correct answer                                 |     P    |       | 
| Error thrown when posting a question without 3 incorrect answers                              |     P    |       | 
|-----------------------------------------------------------------------------------------------|----------|-------|

Get all categories
   <img width="1364" alt="Screen Shot 2023-02-08 at 2 05 09 pm" src="https://user-images.githubusercontent.com/103707253/217418533-5c7348f4-6685-42a2-a693-3ac794fb8bd1.png">

Get all quizzes
   <img width="1272" alt="Screen Shot 2023-02-08 at 2 07 45 pm" src="https://user-images.githubusercontent.com/103707253/217418772-38f5113a-648e-431d-8f56-cb772ca85153.png">

Get all questions
  <img width="1268" alt="Screen Shot 2023-02-08 at 2 08 30 pm" src="https://user-images.githubusercontent.com/103707253/217418986-320387e0-6175-47ec-80bc-2ade3b38b69d.png">
   
Post a new question
   <img width="1297" alt="Screen Shot 2023-02-08 at 2 12 54 pm" src="https://user-images.githubusercontent.com/103707253/217419496-29a02f06-b978-46f0-955c-8c80c556d082.png">

Post a new quiz
   <img width="1261" alt="Screen Shot 2023-02-08 at 2 16 51 pm" src="https://user-images.githubusercontent.com/103707253/217420016-2397837e-aa7b-41b4-b91f-31349940b3f6.png">

Error thrown when category already exists
   <img width="1265" alt="Screen Shot 2023-02-08 at 2 18 04 pm" src="https://user-images.githubusercontent.com/103707253/217420121-7d93537a-cb1d-4b11-ae26-2085a233d82a.png">

Error thrown when the same question already exists in the same quiz
   <img width="1410" alt="Screen Shot 2023-02-08 at 2 19 26 pm" src="https://user-images.githubusercontent.com/103707253/217420292-96f5c15a-32f0-475f-b213-2faa2621e424.png">

Error thrown when correct answer is not provided
   <img width="1479" alt="Screen Shot 2023-02-08 at 2 20 48 pm" src="https://user-images.githubusercontent.com/103707253/217420545-9e210e50-0aac-48d9-8150-213dbbefd248.png">

Error thrown when less then 3 incorrect answers are provided
   <img width="1160" alt="Screen Shot 2023-02-08 at 2 22 33 pm" src="https://user-images.githubusercontent.com/103707253/217420727-243d5577-07f0-4006-a45c-fba53aa89767.png">
   
</details>
<br/>

Automated unit tests were created to check the routes and CRUD operations were functioning as expected. These were written and run using jest and supertest.

<details>

<summary><strong>Unit test log screenshots</strong></summary>
   Test of the Home page
   <img width="1270" alt="Screen Shot 2023-02-08 at 1 10 22 pm" src="https://user-images.githubusercontent.com/103707253/217412633-b82d7543-d2b6-44bf-aac1-da0f849dc4fc.png">
   
   Tests of Category route
   <img width="1261" alt="Screen Shot 2023-02-08 at 11 56 25 am" src="https://user-images.githubusercontent.com/103707253/217412717-fae51d18-7bc5-420b-8fa7-0c22de90f90c.png">

   Test of Quiz route
   <img width="1265" alt="Screen Shot 2023-02-08 at 1 08 49 pm" src="https://user-images.githubusercontent.com/103707253/217412774-09db16fb-49d8-4909-9d43-8fa1df2f9811.png">

   Test of Question Route
   <img width="1265" alt="Screen Shot 2023-02-08 at 11 56 53 am" src="https://user-images.githubusercontent.com/103707253/217412862-7d852136-c0eb-4b92-9b23-05c726a3ab46.png">

</details>
<br/>

Automated integration tests were created to check the application was functioning as a whole. These were also written and run using jest and supertest.

<details>

<summary><strong>Integration test log screenshots</strong></summary>

   To replicate the application's function as a whole, the user should be able able to create a new category, then add a quiz to that category and then add a question to the quiz.
   
   <img width="1255" alt="Screen Shot 2023-02-08 at 2 48 13 pm" src="https://user-images.githubusercontent.com/103707253/217427997-f537e869-f601-457c-a2b3-9d12cfb1f10f.png">

   
</details>
