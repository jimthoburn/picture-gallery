export const RobotsText = ({ host }) => {
  const text = `User-agent: *
Sitemap: ${host}/sitemap.xml
`;
  return text;
};
