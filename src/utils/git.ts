import { PageConfig } from '@jupyterlab/coreutils';


/**
 * If repo exists, return its branches
 */
export async function getRepoInfo(repoUrl: string) {
  if (_checkRepoExists) {
    return _getRepoBranches
  }
}


/**
 * For a given URL to a repo, confirm repo exists and is public.
 */
async function _checkRepoExists(repoUrl: string) {
  var requestUrl = new URL(PageConfig.getBaseUrl() + 'jupyter-server-extension/checkRepoExists');
  requestUrl.searchParams.append("repoUrl", repoUrl);
  let response: any = await fetch(requestUrl.href, { headers: { 'Content-Type': 'application/json' } })

  if (response.status === 200) {
    console.log("Repo exists")
    return true
  } else if (response.status === 404) {
    console.log("Repo does not exist")
    return false
  } else {
    console.log("other error")
    return false
  }
}


/**
  * Return all branches for a given repo.
  */
async function _getRepoBranches(repoUrl: string) {
  var requestUrl = new URL(PageConfig.getBaseUrl() + 'jupyter-server-extension/getRepoBranches');
  requestUrl.searchParams.append("repoUrl", repoUrl);
  let response: any = await fetch(requestUrl.href, { headers: { 'Content-Type': 'application/json' } })

  let branches = []
  if (response.status === 200) {
    console.log("Repo exists")
    // branches = response.json()
    // return branches
  } else if (response.status === 404) {
    console.log("Repo does not exist")
    return false
  } else {
    console.log("other error")
    return false
  }
}



