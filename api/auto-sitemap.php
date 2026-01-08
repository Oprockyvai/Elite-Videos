<?php
/**
 * Auto Sitemap Generator - PHP Version
 * Upload this file to your server and run it
 */

// Configuration
$config = [
    'domain' => 'https://yourdomain.com', // Change this
    'output_file' => 'sitemap.xml',
    'videos_json' => 'api/videos.json',
    'categories_json' => 'api/categories.json',
    'changefreq' => 'daily',
    'priority' => [
        'homepage' => 1.0,
        'categories' => 0.9,
        'videos' => 0.8,
        'legal' => 0.5
    ]
];

// Get current date
function getCurrentDate() {
    return date('Y-m-d');
}

// Calculate expiration date
function getExpirationDate($uploadDate) {
    $date = new DateTime($uploadDate);
    $date->modify('+1 year');
    return $date->format('Y-m-d');
}

// Generate sitemap
function generateSitemap($config, $videos, $categories) {
    $currentDate = getCurrentDate();
    
    $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
    $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"' . "\n";
    $xml .= '        xmlns:xhtml="http://www.w3.org/1999/xhtml"' . "\n";
    $xml .= '        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"' . "\n";
    $xml .= '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">' . "\n\n";

    // Homepage
    $xml .= "    <!-- Homepage -->\n";
    $xml .= "    <url>\n";
    $xml .= "        <loc>{$config['domain']}/</loc>\n";
    $xml .= "        <lastmod>{$currentDate}</lastmod>\n";
    $xml .= "        <changefreq>{$config['changefreq']}</changefreq>\n";
    $xml .= "        <priority>{$config['priority']['homepage']}</priority>\n";
    $xml .= "    </url>\n\n";

    // Search Page
    $xml .= "    <!-- Search Page -->\n";
    $xml .= "    <url>\n";
    $xml .= "        <loc>{$config['domain']}/search</loc>\n";
    $xml .= "        <lastmod>{$currentDate}</lastmod>\n";
    $xml .= "        <changefreq>{$config['changefreq']}</changefreq>\n";
    $xml .= "        <priority>0.8</priority>\n";
    $xml .= "    </url>\n\n";

    // Category Pages
    $xml .= "    <!-- Category Pages -->\n";
    foreach ($categories as $category) {
        $xml .= "    <url>\n";
        $xml .= "        <loc>{$config['domain']}/category/{$category['id']}</loc>\n";
        $xml .= "        <lastmod>{$currentDate}</lastmod>\n";
        $xml .= "        <changefreq>{$config['changefreq']}</changefreq>\n";
        $xml .= "        <priority>{$config['priority']['categories']}</priority>\n";
        $xml .= "    </url>\n";
    }
    $xml .= "\n";

    // Legal Pages
    $legalPages = ['terms', 'privacy', 'dmca', '2257'];
    $xml .= "    <!-- Legal Pages -->\n";
    foreach ($legalPages as $page) {
        $xml .= "    <url>\n";
        $xml .= "        <loc>{$config['domain']}/{$page}</loc>\n";
        $xml .= "        <lastmod>{$currentDate}</lastmod>\n";
        $xml .= "        <changefreq>monthly</changefreq>\n";
        $xml .= "        <priority>{$config['priority']['legal']}</priority>\n";
        $xml .= "    </url>\n";
    }
    $xml .= "\n";

    // Video Pages
    $xml .= "    <!-- Video Pages -->\n";
    foreach ($videos as $video) {
        $expirationDate = getExpirationDate($video['uploadDate']);
        $modelName = isset($video['model'][0]) ? $video['model'][0] : '';
        $modelSlug = strtolower(str_replace(' ', '-', $modelName));
        
        $xml .= "    <url>\n";
        $xml .= "        <loc>{$config['domain']}/video/{$video['id']}</loc>\n";
        $xml .= "        <lastmod>{$video['uploadDate']}</lastmod>\n";
        $xml .= "        <changefreq>weekly</changefreq>\n";
        $xml .= "        <priority>{$config['priority']['videos']}</priority>\n";
        
        // Video XML
        $xml .= "        <video:video>\n";
        $xml .= "            <video:thumbnail_loc>{$config['domain']}{$video['thumbnail']}</video:thumbnail_loc>\n";
        $xml .= "            <video:title><![CDATA[{$video['title']}]]></video:title>\n";
        $xml .= "            <video:description><![CDATA[{$video['description']}]]></video:description>\n";
        $xml .= "            <video:content_loc>" . str_replace('/embed/', '/video/', $video['embedUrl']) . "</video:content_loc>\n";
        $xml .= "            <video:player_loc allow_embed=\"yes\" autoplay=\"ap=1\">{$config['domain']}/video/embed/{$video['id']}</video:player_loc>\n";
        $xml .= "            <video:duration>{$video['duration']}</video:duration>\n";
        $xml .= "            <video:expiration_date>{$expirationDate}</video:expiration_date>\n";
        $xml .= "            <video:rating>{$video['rating']}</video:rating>\n";
        $xml .= "            <video:view_count>{$video['views']}</video:view_count>\n";
        $xml .= "            <video:publication_date>{$video['uploadDate']}</video:publication_date>\n";
        $xml .= "            <video:family_friendly>no</video:family_friendly>\n";
        $xml .= "            <video:requires_subscription>no</video:requires_subscription>\n";
        if ($modelName) {
            $xml .= "            <video:uploader info=\"{$config['domain']}/model/{$modelSlug}\">{$modelName}</video:uploader>\n";
        }
        $xml .= "            <video:live>no</video:live>\n";
        $xml .= "        </video:video>\n";
        
        // Image XML
        $xml .= "        <image:image>\n";
        $xml .= "            <image:loc>{$config['domain']}{$video['thumbnail']}</image:loc>\n";
        $xml .= "            <image:title><![CDATA[{$video['title']}]]></image:title>\n";
        $xml .= "            <image:caption><![CDATA[" . substr($video['description'], 0, 100) . "...]]></image:caption>\n";
        $xml .= "        </image:image>\n";
        
        $xml .= "    </url>\n";
    }

    $xml .= "</urlset>";
    
    return $xml;
}

// Main execution
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    ?>
    <!DOCTYPE html>
    <html>
    <head>
        <title>Sitemap Generator</title>
        <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .container { max-width: 800px; margin: 0 auto; }
            .btn { background: #0073aa; color: white; padding: 10px 20px; border: none; cursor: pointer; }
            .btn:hover { background: #005a87; }
            .success { color: green; }
            .error { color: red; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Auto Sitemap Generator</h1>
            <form method="POST">
                <p><strong>Domain:</strong> <?php echo htmlspecialchars($config['domain']); ?></p>
                <p><strong>Output File:</strong> <?php echo htmlspecialchars($config['output_file']); ?></p>
                <button type="submit" class="btn">Generate Sitemap</button>
            </form>
            <?php
            if ($_GET['success'] ?? false) {
                echo '<p class="success">✅ Sitemap generated successfully!</p>';
            }
            if ($_GET['error'] ?? false) {
                echo '<p class="error">❌ Error generating sitemap: ' . htmlspecialchars($_GET['error']) . '</p>';
            }
            ?>
        </div>
    </body>
    </html>
    <?php
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // Load data files
        if (!file_exists($config['videos_json'])) {
            throw new Exception("Videos JSON file not found");
        }
        if (!file_exists($config['categories_json'])) {
            throw new Exception("Categories JSON file not found");
        }
        
        $videos = json_decode(file_get_contents($config['videos_json']), true);
        $categories = json_decode(file_get_contents($config['categories_json']), true);
        
        if (!$videos || !$categories) {
            throw new Exception("Invalid JSON data");
        }
        
        // Generate sitemap
        $sitemap = generateSitemap($config, $videos, $categories);
        
        // Write to file
        if (file_put_contents($config['output_file'], $sitemap)) {
            header("Location: ?success=1");
        } else {
            throw new Exception("Could not write to file");
        }
        
    } catch (Exception $e) {
        header("Location: ?error=" . urlencode($e->getMessage()));
    }
}
?>