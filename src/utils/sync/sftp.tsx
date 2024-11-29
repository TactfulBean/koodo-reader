import { restore } from "../file/restore";
import StorageUtil from "../service/configService";

class SFtpUtil {
  static UploadFile = async (blob: any) => {
    return new Promise<boolean>(async (resolve, reject) => {
      let { url, username, password, port, dir } = JSON.parse(
        StorageUtil.getReaderConfig("sftp_token") || "{}"
      );
      const fs = window.require("fs");
      const path = window.require("path");
      const { ipcRenderer } = window.require("electron");
      const dirPath = ipcRenderer.sendSync("user-data", "ping");
      const arrayBuffer = await blob.arrayBuffer();
      const fileName = "data.zip";
      fs.writeFileSync(path.join(dirPath, fileName), Buffer.from(arrayBuffer));
      resolve(
        await ipcRenderer.invoke("sftp-upload", {
          url,
          username,
          password,
          fileName,
          port,
          dir,
        })
      );
    });
  };
  static DownloadFile = async () => {
    return new Promise<boolean>(async (resolve, reject) => {
      const fileName = "data.zip";
      const fs = window.require("fs");
      const path = window.require("path");
      const { ipcRenderer } = window.require("electron");
      let { url, username, password, port, dir } = JSON.parse(
        StorageUtil.getReaderConfig("sftp_token") || "{}"
      );
      const dirPath = ipcRenderer.sendSync("user-data", "ping");
      let result = await ipcRenderer.invoke("sftp-download", {
        url,
        username,
        password,
        fileName,
        port,
        dir,
      });
      if (result) {
        var data = fs.readFileSync(path.join(dirPath, fileName));
        let blobTemp: any = new Blob([data], { type: "application/zip" });
        let fileTemp = new File([blobTemp], fileName, {
          lastModified: new Date().getTime(),
          type: blobTemp.type,
        });
        let result = await restore(fileTemp);
        if (!result) resolve(false);
      }
      resolve(true);
      try {
        const fs_extra = window.require("fs-extra");
        fs_extra.remove(path.join(dirPath, fileName), (error: any) => {
          if (error) resolve(false);
          resolve(true);
        });
      } catch (e) {
        console.log("error removing ", path.join(dirPath, fileName));
        resolve(false);
      }
    });
  };
}

export default SFtpUtil;
