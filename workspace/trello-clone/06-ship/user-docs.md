# Trello Clone — User Guide

A simple, single-user task board app: boards containing lists containing
cards, with drag-and-drop reordering. No account, no sign-in, no internet
connection required — everything is stored in your browser.

## Starting the app

```
cd 04-build
npm start
```

Then open **http://localhost:3000** in your browser (Chrome, Firefox, or
Safari, latest version).

To use a different port:

```
PORT=4000 npm start
```

Your boards, lists, and cards are saved automatically to your browser's
local storage, so they're still there the next time you open the app —
even after closing the tab or restarting your computer. (Data is tied to
this browser on this computer; it does not sync across devices or
browsers.)

If your browser blocks local storage (e.g. some private/incognito modes),
you'll see a warning banner — the app still works for your current
session, but nothing will be saved once you close the tab.

## How to...

### See your boards
Open the app. You'll land on the boards overview page, listing every board
you've created. If you have none yet, you'll see an empty state with a
prompt to create your first board.

### Create a board
On the boards overview page, use the "new board" control, type a title,
and confirm. The new board appears in your list immediately.

### Reorder your boards
Drag a board tile to a new position on the overview page. The new order is
saved automatically.

### Open a board
Click any board tile to open it and see its lists (columns), such as
"To Do", "Doing", and "Done".

### Create a list
Inside a board, use the "add list" control and type a title. New boards
start with no lists — the "no lists yet" empty state prompts you to add
the first one.

### Reorder lists
Drag a list by its header to move it left or right within the board.

### Create a card
Inside a list, use the "add card" control and type a title. Empty lists
show a "no cards yet" prompt.

### Reorder or move a card
Drag a card up/down within its list, or drag it into a different list. The
new position is saved automatically.

If you'd rather not use drag-and-drop, open the card and use its
**"Move to..."** dropdown to send it to a specific list instead.

### Edit a card's details
Click a card to open it. You can edit its title and add/edit a free-text
description. Click **Save** to keep your changes. Clicking **Cancel**, the
**X**, or clicking outside the modal (on the overlay) all discard whatever
you typed since you opened the card.

### Delete a card, list, or board
Use the **Delete** button on the card, list, or board. You'll be asked to
confirm before anything is removed — deletion cannot be undone.

### Reload / come back later
Just refresh the page or reopen the app later. All your boards, lists,
cards, and their order are exactly as you left them.

## What this app doesn't do (by design)

This is a small, single-user tool — it intentionally does not include
accounts, login, sharing/collaboration with other people, real-time sync
across tabs or devices, comments, attachments, checklists, an activity log,
or import/export from real Trello. Labels, due dates, and search are not
built in this version either.
