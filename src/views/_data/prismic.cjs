require('dotenv').config();

const prismicH = require('@prismicio/helpers');
const prismic = require('@prismicio/client');
const axios = require('axios');
const amplify = require('aws-amplify/utils');

const PRISMIC_REPO = process.env.PRISMIC_REPOSITORY;
const PRISMIC_TOKEN = process.env.PRISMIC_ACCESS_TOKEN;

const axiosAdapter = async (url, options = {}) => {
  try {
    const response = await axios({ url, ...options });
    return {
      ok: response.status >= 200 && response.status < 300,
      status: response.status,
      statusText: response.statusText,
      json: () => Promise.resolve(response.data),
    };
  } catch (error) {
    if (error.response) {
      return {
        ok: false,
        status: error.response.status,
        statusText: error.response.statusText,
        json: () => Promise.resolve(error.response.data),
      };
    }
    throw error;
  }
};

const client = prismic.createClient(PRISMIC_REPO, {
  accessToken: PRISMIC_TOKEN,
  fetch: axiosAdapter,
});

async function fetchAbout() {
  return client.getSingle('about');
}

async function fetchFooter() {
  return client.getSingle('footer');
}

async function fetchMeta() {
  return client.getSingle('meta');
}

async function fetchNav() {
  return client.getSingle('nav');
}

async function fetchPreloader() {
  return client.getSingle('preloader');
}

async function fetchProjects() {
  return client.getAllByType('project');
}

function gatherAssets(projects) {
  const assets = [];

  projects.forEach((project) => {
    assets.push(project.data.image.url);
  });

  return assets;
}

async function fetchPrismicData() {
  const [about, footer, meta, nav, preloader, projects] = await Promise.all([
    fetchAbout(),
    fetchFooter(),
    fetchMeta(),
    fetchNav(),
    fetchPreloader(),
    fetchProjects(),
  ]);

  const assets = gatherAssets(projects);

  const data = {
    assets,
    about,
    footer,
    meta,
    nav,
    preloader,
    projects: projects.sort((a, b) => b.data.id - a.data.id),
    ...prismicH,
  };

  return data;
}

amplify.Cache.clear();

module.exports = fetchPrismicData;
