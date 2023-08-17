export type IAlgorithm = {
    algorithmID: string
}

export type IAlgorithmConfig = {
    algo_name: string,
    version: string,
    repository_url: string,
    docker_url: string,
    description: string,
    run_command: string,
    build_command: string,
    queue: string,
    disk_space: string,
    inputs: {
        file: any[]
        config: any[]
        positional: any[]
    }
}