import { Button } from "@/src/components/ui/button";
import { Text as BtnText } from "@/src/components/ui/text";
import { Svg, Path, G } from "react-native-svg";

interface SocialLoginButtonsProps {
  onPress?: () => void;
}
//will be changed later instead of manually implementing google styling
function GoogleIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 48 48">
      <Path
        fill="#EA4335"
        d="M24 9.5c3.14 0 5.95 1.08 8.17 2.86l6.08-6.08C34.46 3.04 29.5 1 24 1 14.82 1 7.02 6.49 3.42 14.24l7.08 5.5C12.27 13.47 17.7 9.5 24 9.5z"
      />
      <Path
        fill="#4285F4"
        d="M46.52 24.5c0-1.64-.15-3.22-.41-4.74H24v8.97h12.68c-.55 2.96-2.2 5.47-4.68 7.16l7.19 5.58C43.26 37.5 46.52 31.47 46.52 24.5z"
      />
      <Path
        fill="#FBBC05"
        d="M10.5 28.76A14.77 14.77 0 0 1 9.5 24c0-1.66.28-3.27.78-4.77l-7.08-5.5A23.97 23.97 0 0 0 0 24c0 3.87.92 7.53 2.56 10.76l7.94-5.99z"
      />
      <Path
        fill="#34A853"
        d="M24 47c5.4 0 9.94-1.79 13.26-4.86l-7.19-5.58C28.24 38.15 26.22 39 24 39c-6.27 0-11.59-3.94-13.5-9.44l-7.94 6A22.99 22.99 0 0 0 24 47z"
      />
      <G>
        <Path fill="none" d="M0 0h48v48H0z" />
        <Path fill="none" d="M0 0h48v48H0z" />
      </G>
    </Svg>
  );
}

export default function SocialLoginButtons({ onPress }: SocialLoginButtonsProps) {
  return (
    <Button
      variant="outline"
      onPress={onPress}
      className="bg-white border-edge-outline rounded-lg w-full flex-row gap-3 shadow-sm"
    >
      <GoogleIcon />
      <BtnText className="text-social font-medium">
        Continue with Google
      </BtnText>
    </Button>
  );
}
