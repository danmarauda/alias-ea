const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Expo Config Plugin to disable resource bundle signing in Podfile.
 * This resolves the Xcode 14+ "resource bundles are signed by default" error on EAS Build.
 */
module.exports = function withDisableBundleSigning(config) {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const podfilePath = path.join(config.modRequest.projectRoot, 'ios', 'Podfile');
      let podfileContent = fs.readFileSync(podfilePath, 'utf8');

      // Check if the fix is already present to avoid duplicate injections
      if (podfileContent.includes('CODE_SIGNING_ALLOWED') && podfileContent.includes('product-type.bundle')) {
        return config;
      }

      const fix = `
    # Fix for resource bundle signing in Xcode 14+
    installer.pods_project.targets.each do |target|
      if target.respond_to?(:product_type) && target.product_type == 'com.apple.product-type.bundle'
        target.build_configurations.each do |config|
          config.build_settings['CODE_SIGNING_ALLOWED'] = 'NO'
        end
      end
    end`;

      // Find the post_install block and inject the fix
      if (podfileContent.includes('post_install do |installer|')) {
        podfileContent = podfileContent.replace(
          /post_install do \|installer\|/,
          `post_install do |installer|${fix}`
        );
      } else {
        // If no post_install block exists (unlikely in Expo), we add one
        // But in Luna's Podfile it definitely exists.
      }

      fs.writeFileSync(podfilePath, podfileContent);
      return config;
    },
  ]);
};
