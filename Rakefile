namespace :build do

  pwd = File.dirname(__FILE__)

  task :run do
    dest = pwd + "/dist/osx"
    tibuild = '/Library/Application\ Support/Titanium/sdk/osx/1.2.0.RC4/tibuild.py'

    # Remove previous build directory
    rm_f dest

    # Create the build directory and run the build process
    mkdir_p dest

    sh "#{tibuild} --noinstall -o osx -d '#{dest}' '#{pwd}'"

    # Override the generated Info.plist with our custom version
    cp "#{pwd}/Info.plist", "#{dest}/ListOpen.app/Contents/Info.plist"

    # Launch the app
    exec "#{dest}/ListOpen.app/Contents/MacOS/ListOpen", "--debug"
  end

end
