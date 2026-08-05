# Shalom Karr - Personal Portfolio Website

This repository contains the source code for my personal portfolio website, showcasing my skills, projects, and providing ways to get in touch. The site is designed to be clean, responsive, and highlight my journey as a web developer.

**Live Site:** [https://shalomkarr.com/](https://shalomkarr.com)

## Features

*   **Responsive Design:** Adapts to various screen sizes (desktop, tablet, mobile).
*   **Single-Page Layout:** Smooth scrolling navigation to different sections (Home/Hero, About, Skills, Projects, Contact).
*   **Hero Section:** A welcoming introduction with a clear tagline and call-to-action.
*   **About Me:** A personal introduction detailing my development philosophy and passion.
*   **Skills Showcase:** Highlights key technical proficiencies with relevant icons.
*   **Project Portfolio:**
    *   Dedicated cards for significant projects ("Cleveland Marketplace," "GroupMe Copilot Image Bot - Instructions").
    *   Includes project descriptions and direct links to live demos and GitHub repositories.
*   **Contact Section:** Multiple ways to connect, including email, phone (call/text), GroupMe, and GitHub.
*   **Social Sharing / Link Previews:** Implemented Open Graph and Twitter Card meta tags for rich link previews when the site URL is shared on social media or messaging platforms.
*   **Analytics:**
    *   **Amplitude:** Integrated for product analytics, including default tracking (page views, sessions) and custom event tracking for:
        *   Navigation to different site sections.
        *   Clicks on the "View My Work" CTA button.
        *   Clicks on project links (Live Demo, GitHub).
        *   Clicks on contact links (Email, Call, Text, GroupMe, GitHub).
    *   **(Placeholder for Session Replay)** Amplitude's Session Replay plugin is included for potential future activation and deeper user behavior analysis.
*   **Embedded AI Agent:** Integrates a Jotform AI Agent (presumably as a chat widget) for user interaction/assistance.
*   **Dynamic Content:** Footer year updates automatically.
*   **Font Awesome Icons:** Used for visual cues and enhancing UI elements.
*   **Google Fonts:** Utilizes 'Lato' and 'Roboto' for typography.

## Tech Stack

*   **Frontend:**
    *   HTML5
    *   CSS3 (including Flexbox, Grid for layout)
    *   Vanilla JavaScript (ES6+) for DOM manipulation, event handling, smooth scrolling, and responsive navigation.
*   **Analytics:**
    *   Amplitude (Browser SDK with Session Replay plugin)
*   **Third-Party Embeds:**
    *   Jotform AI Agent

## File Structure

*   `index.html`: The single HTML file for the entire portfolio.
*   `style.css`: Contains all the CSS rules for styling the website.
*   `script.js`: Handles JavaScript functionalities like responsive navigation, smooth scrolling, dynamic year update, and custom Amplitude event tracking.
*   `img/`: Folder for images.
    *   `logo.jpeg`: Logo used in the navigation bar.
    *   `shalom-karr-profile-img-1.jpeg`: Profile picture for the "About Me" section.
    *   `social-preview.jpg`: Image used for social media link previews (Open Graph/Twitter Cards).
*   `favicon.ico`: Icon for the browser tab.

## Setup & Deployment

1.  **Clone the Repository (Optional):**
    ```bash
    git clone https://github.com/Shalom-Karr/YOUR_PORTFOLIO_REPO_NAME.git
    cd YOUR_PORTFOLIO_REPO_NAME
    ```
    *(Replace `YOUR_PORTFOLIO_REPO_NAME` with the actual name of your repository if you create one for this portfolio.)*

2.  **Customize Content:**
    *   Open `index.html` and update any remaining placeholders:
        *   Twitter handle (`@YourTwitterHandle`) in meta tags (or remove if not applicable).
        *   Ensure all image paths in `<img>` tags and meta tags are correct.
        *   Verify all external links (projects, social media).
    *   Add/replace images in the `img/` folder as needed.
    *   Update `favicon.ico`.

3.  **Amplitude API Key:**
    *   Open `index.html`.
    *   Find the Amplitude initialization script in the `<head>`.
    *   Replace `'YOUR_AMPLITUDE_API_KEY'` with your **actual Amplitude API Key**.

4.  **Local Development:**
    *   Open `index.html` directly in your browser or use a simple local server (e.g., VS Code Live Server extension).

5.  **Deployment:**
    *   The site is currently deployed on **Netlify**.
    *   To update, push changes to the linked GitHub repository. Netlify will automatically build and deploy.
    *   Alternatively, the static files can be deployed to any static site hosting provider (GitHub Pages, Vercel, etc.).

## Using the Site

*   Navigate through sections using the top navigation bar or by scrolling.
*   The navigation bar is responsive and uses a "burger" menu on smaller screens.
*   Project cards link to live demos and GitHub repositories.
*   Contact links provide various methods to get in touch.
*   An AI Agent widget (from Jotform) should be available for interaction.

## Future Considerations / Potential Enhancements

*   Activate and configure Amplitude Session Replay more deeply.
*   Add actual screenshots for project previews instead of placeholders.
*   Implement more granular page view tracking for sections if default Amplitude tracking isn't sufficient.
*   Add a contact form (e.g., using Netlify Forms or another service) as an alternative to direct mailto/tel links.
*   Further PWA enhancements (more robust offline caching, add to home screen prompt details).

---

Feel free to provide feedback by opening an issue!
