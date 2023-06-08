import { PageConfig } from '@jupyterlab/coreutils';

export async function registerUsingFile(fileName: string, algo_data: any) {

  const response_file = await createFile(fileName, algo_data)
  console.log(response_file)

  if (response_file) {
    console.log("submitting register")
    const response_register = await register(response_file.file, null)
    const d = JSON.parse(response_register.response)
    console.log(d)
    console.log(d.message.job_web_url)
    return d.message.job_web_url
  }

  // // Create algorithm config file first
  // createFile(fileName, algo_data).then((data) => {
  //   register(data.file, null).then((res) => {
  //     console.log("in register res")
  //     let res_obj = JSON.parse(res.response)
  //     console.log(res_obj)
  //     console.log(res_obj.message.job_web_url)
  //     return res_obj.message.job_web_url
  //   })
  // }).finally((res) => {
  //   console.log(res)
  // })
}

export async function createFile(fileName: string, data: any) {
    var requestUrl = new URL(PageConfig.getBaseUrl() + 'jupyter-server-extension/createFile');
    console.log(requestUrl.href)
    
    requestUrl.searchParams.append("fileName", fileName);
    requestUrl.searchParams.append("data", data);
  
    try {
    const response : any = await fetch(requestUrl.href, {
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error('Request failed');
    }


    console.log("resolved")
    const r_data = await response.json();
    return r_data
  } catch(error) {
    console.log("error in new endpoint")
    console.log(error)
  }
}


export async function register(file: string, data: any) {
    console.log("registering....")

    if (data == null) {
      console.log("register using file")
      var requestUrl = new URL(PageConfig.getBaseUrl() + 'jupyter-server-extension/registerUsingFile');
      console.log(requestUrl.href)
      
      requestUrl.searchParams.append("file", file);
    
      try {
      const response : any = await fetch(requestUrl.href, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
  
      if (!response.ok) {
        throw new Error('Request failed');
      }
  
  
      console.log("resolved register request")
      const r_data = await response.json();
      return r_data
    } catch(error) {
      console.log("error in new register endpoint")
      console.log(error)
    }

    }else{
      console.log("register with data")
    }

    // if (response.status >= 200 && response.status < 400) {
    //     console.log("request went well")
    //     return true
    //   }else{
    //     //let res = response.json()
    //     console.log("something went wrong with request!!!")
    //     return false
    //     //console.log(response.json())
    //   }
}


const filterOptions = (options, inputValue) => {
  const candidate = inputValue.toLowerCase();
  return options.filter(({ label }) => label.toLowerCase().includes(candidate));
};

export async function getResources( inputValue, callback ) {
  var resources: any[] = []
  var requestUrl = new URL(PageConfig.getBaseUrl() + 'jupyter-server-extension/getQueues');
  await fetch(requestUrl.href, {
    headers: {
      'Content-Type': 'application/json'
    }
  }).then((response) => response.json())
    .then((data) => {

      data["response"].forEach((item: any) => {
        let resource: any = {}
        resource["value"] = item
        resource["label"] = item
        resources.push(resource)
      })
      const filtered = filterOptions(resources, inputValue);
      callback(filtered);
      return resources
    });
  return resources
}