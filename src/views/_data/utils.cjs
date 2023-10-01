const handleLinkResolver = (doc) => {
  if (doc.type === 'projects') {
    return `/project/${doc.uid}`;
  }
  if (doc.type === 'about') {
    return '/about';
  }

  return '/';
};

module.exports = { handleLinkResolver };
