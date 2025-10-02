# `depot/push-action`

This action pushes images from the Depot registry to another destination registry. It's intended to be used with `save: true` in the [depot/build-push-action](https://github.com/depot/build-push-action).

## Usage

Push an image to a remote registry:

```yaml
jobs:
  job-name:
    steps:
      - uses: depot/setup-action@v1
      - uses: depot/build-push-action@v1
        id: build
        with:
          save: true
      - uses: depot/push-action@v1
        with:
          build-id: ${{ steps.build.outputs.build-id }}
          tags: |
            org/repo:tag
```

Push a specific bake target to a remote registry:

```yaml
jobs:
  job-name:
    steps:
      - uses: depot/setup-action@v1
      - uses: depot/bake-action@v1
        with:
          save: true
      - uses: depot/push-action@v1
        with:
          build-id: ${{ steps.build.outputs.build-id }}
          tags: |
            org/repo:tag
          target: target-name
```

## Inputs

| Name       | Type     | Required | Description                                                                                                |
| ---------- | -------- | -------- | ---------------------------------------------------------------------------------------------------------- |
| `build-id` | string   | **yes**  | The build ID to pull images for.                                                                           |
| `tags`     | list/CSV | no       | A list of tags to apply to the pushed image.                                                               |
| `target`   | string   | no       | Select which bake target to push.                                                                          |
| `token`    | string   | no       | The API token to use for authentication. This can be overridden by the `DEPOT_TOKEN` environment variable. |

## License

MIT License, see `LICENSE`.
