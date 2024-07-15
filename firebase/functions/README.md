# Bug Workarounds

Bug: [https://github.com/firebase/firebase-tools/issues/6765](https://github.com/firebase/firebase-tools/issues/6765)

Workaround:

In `.env.local`...

```
GCE_METADATA_HOST=0.0.0.0
```
