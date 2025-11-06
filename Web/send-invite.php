<?php
header('Content-Type: application/json');

// Configuration - UPDATE THESE WITH YOUR EMAIL
$admin_email = 'a2@veyeo.com'; // Change this to your email
$from_email = 'noreply@lenoir.app'; // Change this to your domain email

// Check if form was submitted
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Get and sanitize form data
$name = isset($_POST['name']) ? trim($_POST['name']) : '';
$email = isset($_POST['email']) ? trim($_POST['email']) : '';
$company = isset($_POST['company']) ? trim($_POST['company']) : 'Not provided';
$role = isset($_POST['role']) ? trim($_POST['role']) : '';
$message = isset($_POST['message']) ? trim($_POST['message']) : '';
$newsletter = isset($_POST['newsletter']) ? 'Yes' : 'No';

// Validate required fields
if (empty($name) || empty($email) || empty($role) || empty($message)) {
    echo json_encode(['success' => false, 'message' => 'Please fill in all required fields']);
    exit;
}

// Validate email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Please enter a valid email address']);
    exit;
}

// Prepare email to admin
$admin_subject = "🚀 New Lenoir Invite Request from $name";
$admin_message = "
New invitation request received:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 REQUEST DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 Name: $name
📧 Email: $email
🏢 Company/Project: $company
💼 Role: $role
📰 Newsletter: $newsletter

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💬 WHY THEY WANT TO USE LENOIR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

$message

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏰ Submitted: " . date('F j, Y \a\t g:i A') . "
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
";

$admin_headers = "From: Lenoir Invite System <$from_email>\r\n";
$admin_headers .= "Reply-To: $email\r\n";
$admin_headers .= "X-Mailer: PHP/" . phpversion();

// Prepare confirmation email to user
$user_subject = "✅ Your Lenoir Invite Request Has Been Received";
$user_message = "
Hi $name,

Thank you for your interest in Lenoir — The Browser That Builds!

We've received your invitation request and our team will review it shortly. We onboard new users weekly and prioritize builders, designers, and founders who are actively creating.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 YOUR REQUEST SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Name: $name
Email: $email
Company/Project: $company
Role: $role

Your message:
$message

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔍 WHAT'S NEXT?

1. Our team reviews every request personally
2. We'll reach out within 5-7 business days
3. Priority access goes to active builders and creators
4. You'll receive an invite link when approved

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

In the meantime:
• Follow us for updates (add your social links)
• Check out our FAQ: https://lenoir.app/#faq
• Join our community (add Discord/Slack link if you have one)

Questions? Just reply to this email.

Best regards,
The Lenoir Team

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Lenoir — The Browser That Builds
https://lenoir.app
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
";

$user_headers = "From: Lenoir Team <$from_email>\r\n";
$user_headers .= "Reply-To: $admin_email\r\n";
$user_headers .= "X-Mailer: PHP/" . phpversion();

// Send emails
$admin_sent = mail($admin_email, $admin_subject, $admin_message, $admin_headers);
$user_sent = mail($email, $user_subject, $user_message, $user_headers);

// Log the request (optional - create a logs directory first)
$log_entry = date('Y-m-d H:i:s') . " | $name | $email | $role | $company\n";
@file_put_contents('invite-requests.log', $log_entry, FILE_APPEND);

// Return response
if ($admin_sent && $user_sent) {
    echo json_encode([
        'success' => true,
        'message' => 'Thank you! Your invite request has been submitted. Check your email for confirmation.'
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'There was an error sending your request. Please try again or contact us directly.'
    ]);
}
?>
