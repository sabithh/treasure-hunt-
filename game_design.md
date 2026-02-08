# Game Design Document: The Echoes of Section 9

## 1. Game Overview
**Title:** The Echoes of Section 9
**Genre:** Digital Mystery / Puzzle Adventure
**Platform:** Web Browser (Mobile/Desktop)
**Target Audience:** College students (non-tech friendly)
**Duration:** 30-45 minutes

## 2. Story Outline
The player takes on the role of a student journalist at the university. Rumors have always circulated about "Section 9," a basement archive in the old library that was abruptly sealed off 20 years ago following a mysterious incident involving Professor Alden.
The game begins when the player receives a cryptic email from an anonymous sender known only as "Echo." The email claims that the truth about Section 9—and Professor Alden's disappearance—is hidden within the university's public digital archives, if one knows where to look.
As the player solves puzzles, they uncover that Professor Alden didn't disappear; he discovered a way to store human memories in quartz crystals, but the university shutdown the project to suppress the technology. "Echo" is actually an automated system the Professor left behind to find someone worthy of the truth.

## 3. Level Breakdown

### Intro Page
*   **Visual:** A dark, moody screen mimicking an old computer terminal or a dimly lit library desk.
*   **Story Text:** "They said Section 9 was just a storage room. They lied. I found the backdoor, but I can't open it alone. I need a mind that sees patterns where others see noise. Are you ready to find the truth? - Echo"
*   **Action:** "Begin Investigation" button.

### Level 1: The Gatekeeper
*   **Story Text:** "The first step is proving you are looking. The university motto is carved above the library entrance, but in the digital archive, the motto is corrupted. Only the true words will unlock the file."
*   **Puzzle Description:** A glitched image of the university crest is shown. The Latin motto is partially obscured by "digital noise" characters. However, looking closely at the noise, certain letters are highlighted in a subtle different color (e.g., slightly brighter). Reading just the highlighted letters spells out the answer.
*   **Clue/Hint:** "Ignore the noise. Focus on the light."
*   **Answer:** VERITAS

### Level 2: The Blueprint
*   **Story Text:** "Good. You have eyes. Now, we need the map. The official blueprints for the library show a blank wall where Section 9 should be. But deeper layers of the image file hide the door code."
*   **Puzzle Description:** An interactive image of a blueprint. The player activates a toggle for "UV Light Mode". Hovering over the specific "blank wall" area reveals a handwritten 4-digit number.
*   **Clue/Hint:** "Some ink only shows under the right light. Check the blank spaces."
*   **Answer:** 1984

### Level 3: The Audio Log
*   **Story Text:** "I found this audio file in a corrupted sector. It sounds like garbage, but I think it's Alden's voice. He was trying to hide his message from the automated censors."
*   **Puzzle Description:** An audio player with a waveform. The audio plays a garbled, reversed message. The player controls a "Playback Speed / Direction" slider. Dragging it to "-1x" plays the message clearly: "The key is the name of the ship in the painting."
    *   *Accompanying visual:* A desk with a framed photo of a boat named "The Albatross".
*   **Clue/Hint:** "Time only moves forward for those who don't know how to look back."
*   **Answer:** ALBATROSS

### Level 4: The Timeline
*   **Story Text:** "We are close. Alden left a trail of dates, moments where he tested the device. But the system scrambled the order to hide the pattern. Realign the history."
*   **Puzzle Description:** Five event cards are scattered on the screen.
    1.  "First successful memory transfer."
    2.  "Project funding cut."
    3.  "The Section 9 incident."
    4.  "Professor Alden joins the faculty."
    5.  "Project Proposal submitted."
    *   Player must drag and drop them into the correct chronological order based on subtle context clues in the text of each card (e.g., card A mentions "following the success of [Event B]").
    *   Once ordered, a specific letter from each card is highlighted to form the password.
*   **Clue/Hint:** "Cause always comes before effect. Read the notes carefully."
*   **Answer:** MEMORY

### Level 5: The Final Encryption
*   **Story Text:** "This is it. The final lock on Alden's personal terminal. He didn't use a random password. He used the one thing he was trying to save."
*   **Puzzle Description:** A logic puzzle. A grid of words is presented. The player is given three logic constraints:
    1.  "It is not a physical object."
    2.  "It grows when shared, but vanishes if forgotten."
    3.  "It is the opposite of 'Silence'."
    *   Words included: GOLD, LEGACY, SOUND, DATA, LOVE, STORY, NOISE, SECRET.
    *   *Refined Puzzle:* A screen showing Alden's final journal entry with blanks. "I realized that __ isn't stored in neurons, but in the connections between them. To save a __ is to save a life."
*   **Clue/Hint:** "What was this whole project about? It's something you leave behind."
*   **Answer:** LEGACY

## 4. Finale: The Truth
*   **Story Text:** "Access Granted.
    Video file plays. Professor Alden appears, old and tired but smiling.
    'If you are seeing this, then the Echo worked. I didn't verify the technology, I verified *you*. Section 9 wasn't a vault for monsters, it was a library of minds. The university wanted to sell it. I locked it away. But ideas cannot be caged forever. You have the key now. Don't let them forget.'
    
    The screen fades to black. 'Create your own Legacy.'"
*   **Reward:** A digital "Investigator Badge" (downloadable image) and a QR code for a real-life prize/snack at the tech fest desk.

## 5. Suggested UI Flow (Simple)
1.  **Main Container:** Centered card or terminal window on screen.
2.  **Top Bar:** Level Title (e.g., "File 1/5") | Timer (optional, counting up).
3.  **Content Area:** Large media (Image/Audio/Text) + Story Paragraph.
4.  **Input Area:** Text box for answer + "Submit" button.
5.  **Feedback:**
    *   *Correct:* Green flash, typed text effect "Access Granted", "Loading next file...", smooth transition.
    *   *Incorrect:* Red shake, "Invalid Credentials", "Try Again".
6.  **Hint System:** Small "?" icon. Clicking it reveals the hint but adds a specific time penalty to the 'completion time' (if competitive) or just marks the level as "Hint Used".

## 6. Technical Implementation Considerations
*   **Stack:** HTML/CSS/JS (Vanilla or simple framework like React/Vue).
*   **State Management:** Use `localStorage` to save progress so page refreshes don't look progress.
*   **Assets:**
    *   Images can be CSS filters over stock photos.
    *   Audio reversed using basic audio tools.
    *   Fonts: Monospace or "terminal" style fonts (e.g., 'Courier New', 'VT323').
*   **Validation:** Sanitize inputs, trim whitespace, convert to lowercase for comparison.
