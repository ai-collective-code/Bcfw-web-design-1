<?php
/*
 * Copy to config.php (same folder) and fill in. config.php holds secrets: it is git-ignored,
 * and api/.htaccess blocks it from the web. `npm run package:hostinger` writes it for you from .env.
 */
return [
    // The Gmail account that sends the query emails, and its 16-character app password
    // (myaccount.google.com/apppasswords; needs 2-Step Verification).
    'gmail_user' => 'debojit.aic@gmail.com',
    'gmail_app_password' => '',

    // Optional: deliver queries somewhere other than debojit.aic@gmail.com.
    'inquiry_to' => '',

    // Admin Panel login, checked here before edits are published to every visitor.
    'admin_email' => 'debojit.aic@gmail.com',
    'admin_code' => '',   // empty = the default in content.php; set your own
];
