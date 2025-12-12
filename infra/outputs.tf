# Output del ALB
output "alb_info" {
  value = {
    dns_name = aws_lb.app_alb.dns_name
    arn      = aws_lb.app_alb.arn
    zone_id  = aws_lb.app_alb.zone_id
  }
}
