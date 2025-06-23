import React from "react";
import { Helmet } from "react-helmet-async";

type SEOProps = {
  title?: string;
  description?: string;
  url?: string;
  image?: string;
  siteName?: string;
  type?: "website" | "article";
};

const SEO: React.FC<SEOProps> = ({
  title = "Your Default Title",
  description = "Your default description goes here.",
  url = "https://yourwebsite.com",
  image = "https://yourwebsite.com/social-preview.jpg",
  siteName = "Your Site Name",
  type = "website",
}) => {
  return (
    <Helmet prioritizeSeoTags>
      {/* General */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      {/* Open Graph (Facebook, Discord, Telegram) */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:site" content="@yourtwitterhandle" />
      <meta name="twitter:creator" content="@yourtwitterhandle" />

      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" href="/icon.png" />
      <link rel="manifest" href="/site.webmanifest" />
    </Helmet>
  );
};

export default SEO;
