# TALKLINK
This innovative chat app aims to effortlessly connect users worldwide while also serving as a dynamic language-learning tool.
Purpose:
This innovative chat app aims to effortlessly connect users worldwide while also serving as a dynamic language-learning tool. By integrating real-time translation features, the app eliminates linguistic hurdles, making global communication as simple as talking to a neighbor. The built-in gamification, marked by earning achievements, transforms each chat session into an engaging and educational experience. Users not only find it easier to communicate across language barriers but are also motivated to return for future enriching conversations. Overall, the app revolutionizes the way we interact globally and learn languages, making each chat a step toward global fluency.


Pages:
Chatroom: A chat between two users that allows them to send content back and forth.


Settings: Allows the users to customize their client with options like language.


Sign up/ login: A landing page to allow users to sign up or log in, and choose a language.


Search: Allows the user to search for new contacts to create chatrooms with.




Entity-Relationship (ER) https://github.com/Abdurahim00/TALKLINK/assets/104921782/a4e04bc1-0933-4b09-9a86-c939a130db95

The model consists of 4 main entities for now, with upgradability possibilites once the main enteties are emplemented and are working as intended.
Starting with:


User:

The user is the main entity, with it we can start chatroom and send messages tagged with the user’s ID.
The main attributes are: Username, which is unique for every user, a password to allow users to login alongside their username. A list of friends that has been added through the app. Finally, the language attribute that is set by every user, this allows you as a user to recieve a translated message in any language. Meaning that my friend could send me a text in French, but i will see the text in English. We can’t forget about email, as it is crucial for the signup process.

Message:

A message is a piece of data that is sent from one user to another in a chatroom. This will include the content of the message, a foreign key reference the sender and the recipient, a foreign key referencing the chatroom that the message is in, the language, and the timestamp it was sent.

Chat room:

The chat room entity represents the space which two users will chat with each other in. This will include foreign keys referencing the participants, a chat room id, and a name for the chatroom, which will be the username of the other participant.

Achievements:

When two users hit certain milestones, like messaging every day for a week, they will earn an achievement. This achievement will be shown as an icon on the other user’s profile picture. The achievement will have the attributes representing the chat room which it is for, the name, a unique id, the icon which will be shown, and the conditions for unlocking.


Screenshot showcasing the website: https://github.com/Abdurahim00/TALKLINK/assets/104921782/2ecbed7d-a201-42d7-ad3d-e3362ee6570d


