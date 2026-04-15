const fs = require('fs');
const path = require('path');
const dayjs = require('dayjs');
const isoWeek = require('dayjs/plugin/isoWeek');

// 启用 isoWeek 插件
dayjs.extend(isoWeek);

/**
 * 工具类
 */
class Utils {
  /**
   * 生成日期字符串
   * @param {Date} date - 日期对象
   * @param {string} format - 日期格式
   * @returns {string} 格式化后的日期字符串
   */
  static formatDate(date = new Date(), format = 'YYYY-MM-DD') {
    return dayjs(date).format(format);
  }

  /**
   * 生成周字符串 (YYYY-W01 格式)
   * @param {Date} date - 日期对象
   * @returns {string} 格式化后的周字符串
   */
  static formatWeek(date = new Date()) {
    const year = dayjs(date).year();
    const week = String(dayjs(date).isoWeek()).padStart(2, '0');
    return `${year}-W${week}`;
  }

  /**
   * 确保目录存在
   * @param {string} dirPath - 目录路径
   */
  static ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  /**
   * 获取文件路径
   * @param {string} root - 根目录
   * @param {string} subDir - 子目录
   * @param {string} filename - 文件名
   * @returns {string} 完整文件路径
   */
  static getFilePath(root, subDir, filename) {
    return path.join(root, subDir, filename);
  }

  /**
   * 读取文件内容
   * @param {string} filePath - 文件路径
   * @returns {string} 文件内容
   */
  static readFile(filePath) {
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf8');
    }
    return '';
  }

  /**
   * 写入文件内容
   * @param {string} filePath - 文件路径
   * @param {string} content - 文件内容
   */
  static writeFile(filePath, content) {
    // 确保文件所在目录存在
    const dirPath = path.dirname(filePath);
    this.ensureDir(dirPath);
    fs.writeFileSync(filePath, content, 'utf8');
  }

  /**
   * 获取指定目录下的所有文件
   * @param {string} dirPath - 目录路径
   * @returns {string[]} 文件路径数组
   */
  static getFiles(dirPath) {
    if (!fs.existsSync(dirPath)) {
      return [];
    }
    return fs.readdirSync(dirPath).map(file => path.join(dirPath, file));
  }

  /**
   * 删除文件
   * @param {string} filePath - 文件路径
   */
  static deleteFile(filePath) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}

module.exports = Utils;
