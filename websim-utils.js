export async function getCurrentUserStats() {
  try {
    const response = await fetch('/api/v1/user/stats');
    const data = await response.json();
    return data.stats;
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return { total_likes: 0, total_views: 0 };
  }
}

export async function getPublishedUserProjects() {
  try {
    const response = await fetch('/api/v1/user/projects?posted=true');
    const data = await response.json();
    return data.projects.data.map(item => item.project);
  } catch (error) {
    console.error('Error fetching published user projects:', error);
    return [];
  }
}

export async function getCurrentUserProfile() {
  try {
    const response = await fetch('/api/v1/user');
    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}