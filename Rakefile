pwd = File.dirname(__FILE__)
dest = pwd + "/dist"

namespace :build do

  task :osx do
    tibuild = '/Library/Application\ Support/Titanium/sdk/osx/1.2.0.RC4/tibuild.py'

    # Remove previous build directory
    rm_f "#{dest}/osx"

    # Create the build directory and run the build process
    mkdir_p "#{dest}/osx"

    sh "#{tibuild} --noinstall -o osx -d '#{dest}/osx' '#{pwd}'"

    # Override the generated Info.plist with our custom version
    cp "#{pwd}/Info.plist", "#{dest}/osx/ListOpen.app/Contents/Info.plist"

    # Copy custom modules to build directory
    mkdir_p "#{dest}/osx/modules"
    cp_r "#{pwd}/modules/common/.", "#{dest}/osx/ListOpen.app/Contents/modules"
    cp_r "#{pwd}/modules/osx/.", "#{dest}/osx/ListOpen.app/Contents/modules"
  end

  task :linux do
    tibuild = '/home/drslump/.titanium/sdk/linux/1.2.0.RC4/tibuild.py'

    # Remove previous build directory
    rm_f "#{dest}/linux"

    # Create the build directory and run the build process
    mkdir_p "#{dest}/linux"

    sh "#{tibuild} --noinstall -o linux -d '#{dest}/linux' '#{pwd}'"

    # Copy custom modules to build directory
    mkdir_p "#{dest}/linux/modules"
    cp_r "#{pwd}/modules/common/.", "#{dest}/linux/ListOpen/modules"
    cp_r "#{pwd}/modules/linux/.", "#{dest}/linux/ListOpen/modules"
  end

  task :cygwin do
    tibuild = '/cygdrive/c/Documents\ and\ Settings/Administrator/Application\ Data/Titanium/sdk/win32/1.2.0.RC4/tibuild.py'
    python = '/cygdrive/c/Documents\ and\ Settings/Administrator/Application\ Data/Titanium/modules/win32/python/1.2.0.RC4/python'

    rm_f "#{dest}/win32"

    # Create the build directory and run the build process
    mkdir_p "#{dest}/win32"

    tibuild_w = %x( cygpath -w #{tibuild} ).strip!
    dest_w = %x( cygpath -w #{dest} ).strip!
    pwd_w = %x( cygpath -w #{pwd} ).strip!

    # Copy custom modules to build directory
    mkdir_p "#{dest}/win32/modules"
    cp_r "#{pwd}/modules/common/.", "#{dest}/win32/ListOpen/modules"
    cp_r "#{pwd}/modules/win32/.", "#{dest}/win32/ListOpen/modules"

    # Before being able to run it we need to generate the packaging and run the installer
    #
    # Install .Net framework
    # Install WiX 32bit http://wix.codeplex.com/releases/view/60102
    #  
    # "c:\Documents and Settings\Administrator\Application Data\Titanium\modules\win32\python\1.2.0.RC4\python.exe" 
    # "c:\Documents and Settings\Administrator\Application Data\Titanium\sdk\win32\1.2.0.RC4\tibuild.py" 
    # -v -o win32 -t network 
    # -s "c:\Documents and Settings\Administrator\Application Data\Titanium" 
    # -a "c:\Documents and Settings\Administrator\Application Data\Titanium\sdk\win32\1.2.0.RC4" 
    # -d dist\win32 -p test.exe .

    sh "#{python} '#{tibuild_w}' -t network --noinstall -o win32 -d '#{dest_w}/win32' '#{pwd_w}'"
  end

end

namespace :run do

  task :osx => "build:osx"  do
    exec "#{dest}/osx/ListOpen.app/Contents/MacOS/ListOpen", "--debug"
  end

  task :linux => "build:linux" do
    exec "#{dest}/linux/ListOpen/ListOpen", "--debug"
  end

  task :cygwin => "build:cygwin" do
    exec "#{dest}/win32/ListOpen/ListOpen.exe", "--debug"
  end

end
